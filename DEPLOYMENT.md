# VPS Deployment Guide (Docker + Nginx Reverse Proxy)

This document provides step-by-step instructions to deploy the `@abdimas/backend` application to an Ubuntu VPS using Docker and Nginx.

---

## A. Install Docker on Ubuntu

Run the following commands on your Ubuntu VPS to update packages and install Docker and Docker Compose:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo apt install -y docker-compose-plugin
```

Verify that Docker is running:
```bash
sudo systemctl status docker
```

---

## B. Clone the Repository

Clone the project repository to your desired folder on the VPS (typically `/var/www`):

```bash
cd /var/www
git clone <repo-url> pharmindo
cd pharmindo
```

---

## C. Create Production Environment File

Copy the environment variable example file to `.env` inside the backend directory:

```bash
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env
```

Fill in all the required environment variables:
- `DATABASE_URL`: Your PostgreSQL/Neon database URI.
- `BETTER_AUTH_SECRET`: Generate a secure random string (e.g. using `openssl rand -base64 32`).
- `BETTER_AUTH_URL`: The URL of your web frontend (e.g. `https://app.yourdomain.com`).
- `BETTER_AUTH_TRUSTED_ORIGINS`: Comma-separated trusted origins (e.g. `https://app.yourdomain.com`).
- `NIK_ENCRYPTION_KEY_BASE64`: A 32-byte key encoded in base64 (e.g., `openssl rand -base64 32`).
- `NIK_HASH_PEPPER`: A secure random string for hashing NIK (e.g., `openssl rand -base64 64`).
- `BACKEND_URL`: Public address of this API (e.g. `https://api.yourdomain.com`).
- `CORS_ORIGIN`: Your web frontend URL.
- Cloudflare R2 Credentials (if using R2/S3 storage).

---

## D. Build and Run containers

Start the backend container in detached mode (it will build the image on the first run):

```bash
docker compose up -d --build
```

---

## E. Check Logs

Monitor container logs to ensure the application starts up correctly and connects to the database:

```bash
docker logs -f pharmindo-backend
```

---

## F. Test Backend Locally on VPS

Test that the Hono server runs and successfully queries the database:

```bash
curl http://127.0.0.1:4000/health
```

The response should look like:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "service": "backend",
    "database": { "ok": true },
    "checkedAt": "2026-06-05T05:08:53.000Z",
    "responseTimeMs": 15
  }
}
```

---

## G. Setup Nginx Reverse Proxy

Create an Nginx configuration file for your backend API subdomain (e.g., `api.yourdomain.com`):

```bash
sudo nano /etc/nginx/sites-available/pharmindo-backend
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## H. Enable Nginx Config & Restart

Create a symlink to enable the site, verify the configuration syntax, and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/pharmindo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## I. Install SSL via Let's Encrypt

Install Certbot and the Certbot Nginx plugin, then run it to request a free SSL certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## J. Update Deployment (CI/CD / Manual Pull)

When pushing changes to the repository, redeploy on your VPS using the following commands:

```bash
cd /var/www/pharmindo
git pull
docker compose up -d --build
docker image prune -f
```

---

## K. Database Migrations and Seeding

To run migrations or seed data from the VPS, you can run them directly in the workspace using `pnpm` (ensure pnpm is installed and local `.env` exists in the root folder if needed):

```bash
# Run migrations
pnpm --filter @abdimas/db db:migrate

# Optional seed (for first-time setup only)
pnpm seed:admin-login
```
