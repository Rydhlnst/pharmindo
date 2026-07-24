import { inArray, sql } from "drizzle-orm";

import { getDb, uiSyncVersion } from "@abdimas/db";
import { broadcastToClients } from "./ws-bus.js";

type DbLike = ReturnType<typeof getDb>;

export function adminSyncKey(scope: "dashboard" | "verification" | "requests" | "mutations" | "aspirations" | "bansos" | "barang-hilang" | "citizens" | "households" | "schedule") {
  return `admin:${scope}`;
}

export function userSyncKey(userId: string, scope: "identity" | "requests" | "history" | "aspirations") {
  return `user:${userId}:${scope}`;
}

export async function bumpSyncKeys(keys: string[], dbOrTx: DbLike = getDb()) {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  if (uniqueKeys.length === 0) return;

  for (const key of uniqueKeys) {
    await dbOrTx.execute(sql`
      insert into ui_sync_versions (scope_key, version, updated_at)
      values (${key}, 1, now())
      on conflict (scope_key)
      do update set
        version = ui_sync_versions.version + 1,
        updated_at = now()
    `);
  }

  try {
    const rows = await dbOrTx
      .select({ scopeKey: uiSyncVersion.scopeKey, version: uiSyncVersion.version })
      .from(uiSyncVersion)
      .where(inArray(uiSyncVersion.scopeKey, uniqueKeys));

    const versions: Record<string, number> = {};
    for (const row of rows) {
      versions[row.scopeKey] = Number(row.version);
    }
    broadcastToClients(uniqueKeys, versions);
  } catch {
    // best-effort; don't fail the main operation
  }
}
