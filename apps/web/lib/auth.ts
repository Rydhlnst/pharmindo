import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins";
import { z } from "zod";

import { getDb } from "./db";
import { sendOtpEmail } from "./email";
import { env } from "./env";

let _auth: any;

function generateFallbackUsername(seed: string) {
  const base = seed.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "warga";
  const suffix = Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 6) || "000000";
  return `${base}${suffix}`.slice(0, 30);
}

function uniqueOrigins(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (value || "").split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function getAuth() {
  if (_auth) return _auth;

  const baseURL =
    env.BETTER_AUTH_URL() ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const trustedOrigins = uniqueOrigins([
    baseURL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ]);

  _auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET(),
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID(),
        clientSecret: env.GOOGLE_CLIENT_SECRET(),
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Google sign-up has no username (Google only gives name/email/image),
          // but our user table requires one — fill in a fallback so account creation doesn't fail.
          before: async (user) => {
            if (user.username) return;
            const generatedUsername = generateFallbackUsername(user.email?.split("@")[0] || user.name || "warga");
            return {
              data: {
                username: generatedUsername,
                displayUsername: user.name || generatedUsername,
              },
            };
          },
        },
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          input: false,
          defaultValue: "USER",
          returned: true,
          validator: { input: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]) },
        },
        phoneNumber: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
      },
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (u) => /^[a-zA-Z0-9]+$/.test(u),
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        sendVerificationOnSignUp: false,
        async sendVerificationOTP({ email, otp }) {
          await sendOtpEmail(email, otp);
        },
      }),
      nextCookies(),
    ],
  });

  return _auth;
}

// Better Auth CLI expects a default export OR a named export called `auth`.
// Ref: https://better-auth.com/docs/concepts/cli
export const auth = getAuth();
export default auth;
