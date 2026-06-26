# VPS Deployment Guide (Git + Docker + Nginx)

This document covers deploying `@abdimas/backend` to your own Ubuntu VPS using a git-based workflow (clone once, `git pull` to update) with Docker Compose, plus the matching frontend setup on Vercel.

Repo: `https://github.com/Rydhlnst/pharmindo.git`

---

## A. Install Docker on Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo apt install -y docker-compose-plugin
sudo systemctl status docker
```

---

## B. Clone the Repository

```bash
cd /var/www
git clone https://github.com/Rydhlnst/pharmindo.git pharmindo
cd pharmindo
```

For subsequent deploys, you'll just `git pull` inside this same directory — see section J.

---

## C. Create Production Environment File

```bash
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env
```

Fill in:
- `DATABASE_URL` — your Postgres connection string. This codebase uses `@neondatabase/serverless`, so a [Neon](https://neon.tech) database is the easiest fit; any Postgres works, but a self-hosted one needs to be reachable from this VPS.
- `BETTER_AUTH_SECRET` — random string (`openssl rand -base64 32`).
- `BETTER_AUTH_URL` / `BETTER_AUTH_TRUSTED_ORIGINS` — your frontend URL (e.g. `https://app.yourdomain.com`).
- `NIK_ENCRYPTION_KEY_BASE64` — 32-byte base64 key (`openssl rand -base64 32`).
- `NIK_HASH_PEPPER` — random string (`openssl rand -base64 48`).
- `ADMIN_EMAILS` — comma-separated admin emails.
- `BACKEND_URL` — public address of this API (e.g. `https://api.yourdomain.com`).
- `CORS_ORIGIN` — your frontend URL.
- Cloudflare R2 credentials, if you use file uploads (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`).

The backend does **not** need Google OAuth or SMTP credentials — those only run inside `apps/web` (see section L).

---

## D. Build and Run the Backend Container

```bash
docker compose up -d --build backend
```

This builds the image from `apps/backend/Dockerfile` and starts it as `pharmindo-backend`, bound to `127.0.0.1:4000` only (not public — Nginx fronts it, see section G).

---

## E. Check Logs

```bash
docker logs -f pharmindo-backend
```

---

## F. Test Backend Locally on the VPS

```bash
curl http://127.0.0.1:4000/health
```

Expected:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "service": "backend",
    "database": { "ok": true },
    "checkedAt": "2026-06-26T05:08:53.000Z",
    "responseTimeMs": 15
  }
}
```

---

## G. Set Up Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/pharmindo-backend
```

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

```bash
sudo ln -s /etc/nginx/sites-available/pharmindo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## H. Install SSL via Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## I. Database Migrations

Run migrations from the VPS (needs Node + pnpm available on the host, not just inside the container):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

pnpm install --frozen-lockfile
pnpm --filter @abdimas/db db:migrate
```

**Known issue to check before relying on this:** this repo's migration journal has at least one past entry with a timestamp incorrectly set in the future. Drizzle's migrator only applies migrations newer than the latest *recorded* timestamp, so if that bogus future date is still in `drizzle.__drizzle_migrations`, newly generated migrations can silently get skipped (no error — they just don't run). After running `db:migrate`, always verify the expected schema actually changed:

```bash
psql "$DATABASE_URL" -c "\d \"user\""
```

If a column/table you expect is missing despite "Migrations applied successfully", that poisoned timestamp is almost certainly why — don't keep re-running migrate expecting it to fix itself; the underlying journal entry needs to be corrected first (compare `packages/db/drizzle/meta/_journal.json` against `drizzle.__drizzle_migrations` in your DB).

Optional first-time seed:
```bash
pnpm seed:admin-login
```

---

## J. Update Deployment (git pull workflow)

```bash
cd /var/www/pharmindo
git pull
pnpm install --frozen-lockfile
docker compose up -d --build backend
docker image prune -f
pnpm --filter @abdimas/db db:migrate
```

Run the migration step every time you pull changes that touch `packages/db/src/schema/`, even if you don't see new `.sql` files locally — `db:generate` must have been run and committed upstream first.

---

## K. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

Do not expose port `4000` publicly — only Nginx should be public-facing.

---

## L. Frontend on Vercel

The frontend (`apps/web`) is **not** deployed from this VPS — it deploys from Vercel, connected to the same GitHub repo.

Vercel project settings:
- Root Directory: `apps/web`
- Framework Preset: Next.js
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`
- Build Command: `cd ../.. && pnpm build:web`

Required Vercel environment variables (use `deploy/vercel.env.example` as the template):

```bash
APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
BETTER_AUTH_URL=https://app.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Must match the VPS backend .env exactly
DATABASE_URL=...
BETTER_AUTH_SECRET=...
NIK_ENCRYPTION_KEY_BASE64=...
NIK_HASH_PEPPER=...
ADMIN_EMAILS=...

# Google OAuth — Google Cloud Console > APIs & Services > Credentials
# Authorized redirect URI: https://app.yourdomain.com/api/auth/callback/google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# SMTP relay for email OTP verification (Brevo free tier: smtp-relay.brevo.com)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=no-reply@yourdomain.com
```

`GOOGLE_CLIENT_ID/SECRET` and `SMTP_*` only need to exist on Vercel — the VPS backend never touches them.

`NEXT_PUBLIC_BACKEND_URL` should stay empty unless you intentionally want the browser to call the VPS API directly instead of going through Vercel's `/api/platform/*` rewrite.

---

## M. After-Deploy Smoke Checks

```bash
curl https://api.yourdomain.com/health
curl -I https://app.yourdomain.com
```

Then in the browser:
1. Sign up with username/phone/email/password — confirm the OTP email arrives.
2. Sign in with Google — confirm it lands on `/warga` (first-time Google sign-up auto-generates a username; if it errors with `unable_to_create_user`, the Vercel deploy is running stale code from before this was fixed in `apps/web/lib/auth.ts`).
3. Open `/warga/settings/identity`, submit a test profile, confirm it saves.
4. Confirm a citizen feature gated behind `verifiedWargaMiddleware` still blocks access until an admin verifies the identity.

---

## Code Review Notes

- **Blocker:** use the same `BETTER_AUTH_SECRET`, `DATABASE_URL`, `NIK_ENCRYPTION_KEY_BASE64`, `NIK_HASH_PEPPER` on both Vercel and the VPS — session validation and NIK decryption depend on them matching exactly.
- **Blocker:** keep port `4000` private; only Nginx should be public.
- **Blocker:** set `BACKEND_URL` on Vercel to the real API domain, not `localhost`.
- **Blocker:** the Google OAuth redirect URI registered in Google Cloud Console must exactly match `{BETTER_AUTH_URL}/api/auth/callback/google` for both your Vercel production URL and any preview/staging domains you use.
- **Recommended:** verify your Brevo sender address (Senders, Domains & Dedicated IPs → Senders in the Brevo dashboard) before relying on OTP emails in production — unverified senders silently fail to send.
- **Recommended:** use a managed Postgres (Neon) instead of self-hosting the database on this VPS.
