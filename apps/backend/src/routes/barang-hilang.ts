import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import {
  barangHilangListQuerySchema,
  createBarangHilangSchema,
  idParamSchema,
  updateBarangHilangSchema,
} from "@abdimas/contracts";
import { barangHilang, getDb, user, userIdentity } from "@abdimas/db";

import { logAdminActivity } from "../lib/admin-logs.js";
import { forbidden, notFound } from "../lib/errors.js";
import { isRtInScope } from "../lib/admin-access.js";
import { buildPageMeta, getOffset } from "../lib/pagination.js";
import { createRateLimitMiddleware } from "../lib/rate-limit.js";
import { created, ok } from "../lib/response.js";
import { toIso } from "../lib/serialize.js";
import { parseJson, parseParams, parseQuery, sanitizeSearchTerm } from "../lib/validation.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";
import { buildScopeFilter } from "../lib/admin-access.js";
import { adminSyncKey, bumpSyncKeys } from "../lib/sync.js";

type BarangHilangRow = typeof barangHilang.$inferSelect;

function mapBarangHilang(row: BarangHilangRow, reporterName?: string | null, reporterEmail?: string | null, handlerName?: string | null) {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    reporterId: row.reporterId,
    reporterName: reporterName ?? "",
    reporterEmail: reporterEmail ?? null,
    status: row.status,
    priority: row.priority,
    itemName: row.itemName,
    category: row.category,
    itemDescription: row.itemDescription,
    color: row.color ?? null,
    estimatedValue: row.estimatedValue ?? null,
    incidentDate: row.incidentDate,
    incidentTime: row.incidentTime ?? null,
    location: row.location,
    chronicle: row.chronicle,
    photos: (row.photos ?? []) as Array<{ url: string; originalFilename: string; thumbnailUrl?: string }>,
    verificationChecklist: row.verificationChecklist ?? null,
    handledBy: row.handledBy ?? null,
    handledByName: handlerName ?? null,
    adminNotes: row.adminNotes ?? null,
    adminReply: row.adminReply ?? null,
    notes: row.notes ?? null,
    createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(row.updatedAt) ?? new Date().toISOString(),
  };
}

async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const result = await getDb().execute<{ count: string }>(
    sql`select count(*)::text as count from barang_hilang where ticket_number like ${`BH-${year}-%`}`,
  );
  const count = Number(result.rows?.[0]?.count ?? 0) + 1;
  return `BH-${year}-${String(count).padStart(4, "0")}`;
}

export const adminBarangHilangRoutes = new Hono<{ Variables: { sessionUser: { id: string; role: string } } }>()
  .use("*", adminMiddleware)
  .get("/", async (c) => {
    const query = parseQuery(
      {
        page: c.req.query("page"),
        limit: c.req.query("limit"),
        q: sanitizeSearchTerm(c.req.query("q") || undefined),
        status: c.req.query("status") || undefined,
        priority: c.req.query("priority") || undefined,
      },
      barangHilangListQuerySchema,
    );

    const scopeFilter = buildScopeFilter(c.get("sessionUser"), userIdentity.rt);
    const filters = [];
    if (scopeFilter) filters.push(scopeFilter);
    if (query.q) {
      filters.push(
        or(
          ilike(barangHilang.itemName, `%${query.q}%`),
          ilike(barangHilang.ticketNumber, `%${query.q}%`),
          ilike(barangHilang.location, `%${query.q}%`),
        ),
      );
    }
    if (query.status) filters.push(eq(barangHilang.status, query.status));
    if (query.priority) filters.push(eq(barangHilang.priority, query.priority));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;
    const offset = getOffset(query.page, query.limit);

    const [rows, totalRows] = await Promise.all([
      getDb()
        .select({
          bh: barangHilang,
          reporterName: user.name,
          reporterEmail: user.email,
        })
        .from(barangHilang)
        .leftJoin(user, eq(user.id, barangHilang.reporterId))
        .leftJoin(userIdentity, eq(userIdentity.userId, barangHilang.reporterId))
        .where(whereClause)
        .orderBy(desc(barangHilang.createdAt))
        .limit(query.limit)
        .offset(offset),
      getDb()
        .select({ count: sql<number>`count(*)::int` })
        .from(barangHilang)
        .leftJoin(userIdentity, eq(userIdentity.userId, barangHilang.reporterId))
        .where(whereClause),
    ]);

    const data = rows.map((r) => mapBarangHilang(r.bh, r.reporterName, r.reporterEmail));
    const total = Number(totalRows[0]?.count ?? 0);
    return ok(c, data, buildPageMeta({ page: query.page, limit: query.limit, total }));
  })
  .get("/stats", async (c) => {
    const scopeFilter = buildScopeFilter(c.get("sessionUser"), userIdentity.rt);
    const rows = await getDb()
      .select({ status: barangHilang.status, count: sql<number>`count(*)::int` })
      .from(barangHilang)
      .leftJoin(userIdentity, eq(userIdentity.userId, barangHilang.reporterId))
      .where(scopeFilter)
      .groupBy(barangHilang.status);

    const byStatus: Record<string, number> = {
      pending_verification: 0,
      in_verification: 0,
      processing: 0,
      resolved: 0,
      rejected: 0,
      archived: 0,
    };
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = Number(row.count);
      total += Number(row.count);
    }
    return ok(c, { total, byStatus });
  })
  .get("/:id", async (c) => {
    const { id } = parseParams(c.req.param(), idParamSchema);
    const scopeFilter = buildScopeFilter(c.get("sessionUser"), userIdentity.rt);
    const rows = await getDb()
      .select({
        bh: barangHilang,
        reporterName: user.name,
        reporterEmail: user.email,
      })
      .from(barangHilang)
      .leftJoin(user, eq(user.id, barangHilang.reporterId))
      .leftJoin(userIdentity, eq(userIdentity.userId, barangHilang.reporterId))
      .where(and(eq(barangHilang.id, id), scopeFilter))
      .limit(1);

    const row = rows[0];
    if (!row) throw notFound("Barang hilang not found");
    return ok(c, mapBarangHilang(row.bh, row.reporterName, row.reporterEmail));
  })
  .patch("/:id", createRateLimitMiddleware({ key: "barang-hilang-write", limit: 60, windowMs: 60_000 }), async (c) => {
    const sessionUser = c.get("sessionUser");
    const { id } = parseParams(c.req.param(), idParamSchema);
    const body = await parseJson(c.req.raw, updateBarangHilangSchema);

    // Scope validation: check reporter's RT
    const [existing] = await getDb()
      .select({ reporterId: barangHilang.reporterId })
      .from(barangHilang)
      .where(eq(barangHilang.id, id))
      .limit(1);
    if (!existing) throw notFound("Barang hilang not found");

    const [userIdentityRow] = await getDb()
      .select({ rt: userIdentity.rt })
      .from(userIdentity)
      .where(eq(userIdentity.userId, existing.reporterId))
      .limit(1);
    if (userIdentityRow && !isRtInScope(sessionUser, userIdentityRow.rt!)) {
      throw forbidden("Barang hilang does not belong to your RT scope");
    }

    const [updated] = await getDb()
      .update(barangHilang)
      .set(body)
      .where(eq(barangHilang.id, id))
      .returning();
    if (!updated) throw notFound("Barang hilang not found");

    await logAdminActivity({
      adminId: sessionUser.id,
      action: "BARANG_HILANG_UPDATED",
      entityType: "BARANG_HILANG",
      entityId: updated.id,
    });
    await bumpSyncKeys([adminSyncKey("barang-hilang")]);
    return ok(c, mapBarangHilang(updated));
  })
  .delete("/:id", async (c) => {
    const sessionUser = c.get("sessionUser");
    const { id } = parseParams(c.req.param(), idParamSchema);

    // Scope validation: check reporter's RT
    const [existing] = await getDb()
      .select({ reporterId: barangHilang.reporterId })
      .from(barangHilang)
      .where(eq(barangHilang.id, id))
      .limit(1);
    if (!existing) throw notFound("Barang hilang not found");

    const [userIdentityRow] = await getDb()
      .select({ rt: userIdentity.rt })
      .from(userIdentity)
      .where(eq(userIdentity.userId, existing.reporterId))
      .limit(1);
    if (userIdentityRow && !isRtInScope(sessionUser, userIdentityRow.rt!)) {
      throw forbidden("Barang hilang does not belong to your RT scope");
    }

    const [deleted] = await getDb().delete(barangHilang).where(eq(barangHilang.id, id)).returning();
    if (!deleted) throw notFound("Barang hilang not found");
    await logAdminActivity({
      adminId: sessionUser.id,
      action: "BARANG_HILANG_DELETED",
      entityType: "BARANG_HILANG",
      entityId: deleted.id,
    });
    await bumpSyncKeys([adminSyncKey("barang-hilang")]);
    return ok(c, { id: deleted.id });
  });

export const barangHilangRoutes = new Hono<{ Variables: { sessionUser: { id: string; role: string } } }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const sessionUser = c.get("sessionUser");
    const query = parseQuery(
      {
        page: c.req.query("page"),
        limit: c.req.query("limit"),
        q: sanitizeSearchTerm(c.req.query("q") || undefined),
        status: c.req.query("status") || undefined,
        priority: c.req.query("priority") || undefined,
      },
      barangHilangListQuerySchema,
    );

    const filters = [eq(barangHilang.reporterId, sessionUser.id)];
    if (query.status) filters.push(eq(barangHilang.status, query.status));

    const rows = await getDb()
      .select()
      .from(barangHilang)
      .where(and(...filters))
      .orderBy(desc(barangHilang.createdAt))
      .limit(query.limit)
      .offset(getOffset(query.page, query.limit));

    return ok(c, rows.map((r) => mapBarangHilang(r)));
  })
  .get("/:id", async (c) => {
    const sessionUser = c.get("sessionUser");
    const { id } = parseParams(c.req.param(), idParamSchema);
    const [row] = await getDb()
      .select()
      .from(barangHilang)
      .where(and(eq(barangHilang.id, id), eq(barangHilang.reporterId, sessionUser.id)))
      .limit(1);
    if (!row) throw notFound("Barang hilang not found");
    return ok(c, mapBarangHilang(row));
  })
  .post("/", createRateLimitMiddleware({ key: "barang-hilang-submit", limit: 10, windowMs: 60_000 }), async (c) => {
    const sessionUser = c.get("sessionUser");
    const body = await parseJson(c.req.raw, createBarangHilangSchema);
    const ticketNumber = await generateTicketNumber();

    const [row] = await getDb()
      .insert(barangHilang)
      .values({
        ticketNumber,
        reporterId: sessionUser.id,
        itemName: body.itemName,
        category: body.category,
        itemDescription: body.itemDescription,
        color: body.color ?? null,
        estimatedValue: body.estimatedValue ?? null,
        incidentDate: body.incidentDate,
        incidentTime: body.incidentTime ?? null,
        location: body.location,
        chronicle: body.chronicle,
        photos: body.photos ?? [],
        notes: body.notes ?? null,
      })
      .returning();

    await bumpSyncKeys([adminSyncKey("barang-hilang")]);
    return created(c, mapBarangHilang(row));
  })
  .patch("/:id", createRateLimitMiddleware({ key: "barang-hilang-user-write", limit: 20, windowMs: 60_000 }), async (c) => {
    const sessionUser = c.get("sessionUser");
    const { id } = parseParams(c.req.param(), idParamSchema);
    const body = await parseJson(c.req.raw, z.object({
      status: z.enum(["resolved"]).optional(),
    }));

    const [existing] = await getDb()
      .select({ id: barangHilang.id, status: barangHilang.status })
      .from(barangHilang)
      .where(and(eq(barangHilang.id, id), eq(barangHilang.reporterId, sessionUser.id)))
      .limit(1);
    if (!existing) throw notFound("Barang hilang not found");

    if (body.status === "resolved" && existing.status !== "processing") {
      throw new Error("Laporan hanya bisa ditutup saat status sedang diproses");
    }

    const [updated] = await getDb()
      .update(barangHilang)
      .set({ status: body.status ?? existing.status })
      .where(eq(barangHilang.id, id))
      .returning();

    await bumpSyncKeys([adminSyncKey("barang-hilang")]);
    return ok(c, mapBarangHilang(updated));
  });
