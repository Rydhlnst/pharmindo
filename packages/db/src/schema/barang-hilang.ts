import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, jsonb, integer, date } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const reportStatusEnum = pgEnum("barang_hilang_status", [
  "pending_verification",
  "in_verification",
  "processing",
  "resolved",
  "rejected",
  "archived",
]);

export const reportPriorityEnum = pgEnum("barang_hilang_priority", [
  "low",
  "medium",
  "high",
]);

export const barangHilang = pgTable(
  "barang_hilang",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    ticketNumber: text("ticket_number").notNull().unique(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    status: reportStatusEnum("status").notNull().default("pending_verification"),
    priority: reportPriorityEnum("priority").notNull().default("low"),
    
    itemName: text("item_name").notNull(),
    category: text("category").notNull(),
    itemDescription: text("item_description").notNull(),
    color: text("color"),
    estimatedValue: integer("estimated_value"),
    
    incidentDate: date("incident_date", { mode: "string" }).notNull(),
    incidentTime: text("incident_time"),
    location: text("location").notNull(),
    chronicle: text("chronicle").notNull(),
    
    photos: jsonb("photos").$type<Array<{ url: string; originalFilename: string; thumbnailUrl?: string }>>().default([]),
    verificationChecklist: jsonb("verification_checklist").$type<{
      identityComplete: boolean;
      descriptionAdequate: boolean;
      photoAttached: boolean;
      chronicleClear: boolean;
      whatsappVerified: boolean;
    }>(),
    
    handledBy: text("handled_by").references(() => user.id, { onDelete: "set null" }),
    adminNotes: text("admin_notes"),
    adminReply: text("admin_reply"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    reporterIdx: index("barang_hilang_reporter_idx").on(t.reporterId),
    statusIdx: index("barang_hilang_status_idx").on(t.status),
    ticketIdx: index("barang_hilang_ticket_idx").on(t.ticketNumber),
  })
);

export const barangHilangRelations = relations(barangHilang, ({ one }) => ({
  reporter: one(user, { fields: [barangHilang.reporterId], references: [user.id] }),
  handler: one(user, { fields: [barangHilang.handledBy], references: [user.id] }),
}));
