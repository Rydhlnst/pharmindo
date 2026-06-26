import fs from "fs";
import path from "path";

function readRootEnv(name: string) {
  const envPath = path.resolve(process.cwd(), "../../.env");
  if (!fs.existsSync(envPath) || !fs.statSync(envPath).isFile()) return undefined;

  const text = fs.readFileSync(envPath, "utf8");
  const match = text.match(new RegExp(`(?:^|\\r?\\n)${name}=([^\\r\\n]+)`));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "");
}

function required(name: string) {
  const value = process.env[name] || readRootEnv(name);
  if (!value) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return `BUILD_ONLY_${name}`;
    }
    throw new Error(`Missing ${name} env var`);
  }
  return value;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  BETTER_AUTH_SECRET: () => required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: () => process.env.BETTER_AUTH_URL || readRootEnv("BETTER_AUTH_URL"),
  ADMIN_EMAILS: () => (process.env.ADMIN_EMAILS || readRootEnv("ADMIN_EMAILS") || "").split(",").map((s) => s.trim()).filter(Boolean),
  NIK_ENCRYPTION_KEY_BASE64: () => required("NIK_ENCRYPTION_KEY_BASE64"),
  NIK_HASH_PEPPER: () => required("NIK_HASH_PEPPER"),
  GOOGLE_CLIENT_ID: () => process.env.GOOGLE_CLIENT_ID || readRootEnv("GOOGLE_CLIENT_ID") || "",
  GOOGLE_CLIENT_SECRET: () =>
    process.env.GOOGLE_CLIENT_SECRET || readRootEnv("GOOGLE_CLIENT_SECRET") || "",
  SMTP_HOST: () => process.env.SMTP_HOST || readRootEnv("SMTP_HOST") || "",
  SMTP_PORT: () => Number(process.env.SMTP_PORT || readRootEnv("SMTP_PORT") || 587),
  SMTP_USER: () => process.env.SMTP_USER || readRootEnv("SMTP_USER") || "",
  SMTP_PASS: () => process.env.SMTP_PASS || readRootEnv("SMTP_PASS") || "",
  SMTP_FROM: () => process.env.SMTP_FROM || readRootEnv("SMTP_FROM") || "no-reply@rw25pharmindo.my.id",
};
