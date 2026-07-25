import { Hono } from "hono";
import { z } from "zod";

import { fail, ok } from "../lib/response.js";
import { adminSyncKey, bumpSyncKeys, userSyncKey } from "../lib/sync.js";

const ADMIN_SCOPES = new Set([
  "dashboard",
  "verification",
  "requests",
  "mutations",
  "aspirations",
  "bansos",
  "barang-hilang",
  "citizens",
  "households",
  "schedule",
] as const);
const USER_SCOPES = new Set(["identity", "requests", "history", "aspirations"] as const);

// Allow-list check so a leaked secret can't be used to write arbitrary keys.
function isAllowedKey(key: string): boolean {
  if (key.startsWith("admin:")) {
    return ADMIN_SCOPES.has(key.slice("admin:".length) as never);
  }
  if (key.startsWith("user:")) {
    const rest = key.slice("user:".length);
    const sepIdx = rest.lastIndexOf(":");
    if (sepIdx <= 0) return false;
    const scope = rest.slice(sepIdx + 1);
    return USER_SCOPES.has(scope as never);
  }
  return false;
}

const bodySchema = z.object({
  keys: z.array(z.string().min(1)).min(1).max(50),
});

export const internalRoutes = new Hono()
  .use("*", async (c, next) => {
    const secret = process.env.INTERNAL_BUS_SECRET;
    if (!secret) return fail(c, "FORBIDDEN", "Internal bus disabled", 403);
    const provided = c.req.header("x-internal-secret");
    if (!provided || provided !== secret) return fail(c, "FORBIDDEN", "Invalid internal secret", 403);
    await next();
  })
  .post("/bump", async (c) => {
    const json = await c.req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return fail(c, "VALIDATION_ERROR", "Invalid keys payload", 400);

    const filtered = parsed.data.keys.filter(isAllowedKey);
    if (filtered.length === 0) return fail(c, "VALIDATION_ERROR", "No allowed sync keys", 400);

    await bumpSyncKeys(filtered);
    return ok(c, { bumped: filtered });
  });

export { adminSyncKey as _adminSyncKey, userSyncKey as _userSyncKey };
