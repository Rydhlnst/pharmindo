import { sql } from "drizzle-orm";

import { getDb } from "@abdimas/db";

type DbLike = ReturnType<typeof getDb>;

export function adminSyncKey(scope: "dashboard" | "verification" | "requests" | "mutations" | "aspirations") {
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
}
