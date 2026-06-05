import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const uiSyncVersion = pgTable("ui_sync_versions", {
  scopeKey: text("scope_key").primaryKey(),
  version: bigint("version", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
