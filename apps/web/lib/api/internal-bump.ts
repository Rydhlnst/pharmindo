import { getBackendServerUrl } from "./backend";

/**
 * Bump sync keys on the Hono backend from a Next.js API route. Needed because
 * the WebSocket bus lives in-process on the Hono side — a plain DB write from
 * Next.js updates ui_sync_versions but never pushes to connected admins.
 *
 * Best-effort: never throws. The Hono endpoint (routes/internal.ts) checks a
 * shared secret (INTERNAL_BUS_SECRET) and only accepts allow-listed keys.
 */
export async function bumpSyncKeysViaBackend(keys: string[]): Promise<void> {
  const secret = process.env.INTERNAL_BUS_SECRET;
  if (!secret) return;
  const url = `${getBackendServerUrl()}/internal/bump`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ keys }),
      cache: "no-store",
    });
  } catch {
    // fire-and-forget; admins fall back to HTTP polling of /sync/versions
  }
}
