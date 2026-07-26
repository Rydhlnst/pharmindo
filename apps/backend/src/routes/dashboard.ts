import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";

import { reportSummaryResponseSchema } from "@abdimas/contracts";
import {
  adminActivityLog,
  aspiration,
  citizen,
  getDb,
  household,
  mutation,
  user,
  userIdentity,
} from "@abdimas/db";

import { getRoleLabel } from "../lib/admin-access.js";
import { buildScopeFilter } from "../lib/admin-access.js";
import { ok } from "../lib/response.js";
import { adminMiddleware } from "../middleware/auth.js";
import { getCanonicalDashboardBadges, getCanonicalLiveStats } from "../services/admin-reporting.js";

export const dashboardRoutes = new Hono<{ Variables: { sessionUser: { id: string; role: string } } }>()
  .use("*", adminMiddleware)
  .get("/", async (c) => {
    const db = getDb();
    const sessionUser = c.get("sessionUser");
    const scopeFilter = buildScopeFilter(sessionUser, citizen.rt);
    const householdScopeFilter = buildScopeFilter(sessionUser, household.rt);
    const identityScopeFilter = buildScopeFilter(sessionUser, userIdentity.rt);
    const [
      liveStats,
      badgeStats,
      [{ deltaWarga }],
      [{ deltaKK }],
      [{ deltaMutasi }],
      latestLogRows,
      latestAspirationRows,
    ] = await Promise.all([
      getCanonicalLiveStats(scopeFilter, {}, identityScopeFilter, householdScopeFilter),
      getCanonicalDashboardBadges(scopeFilter, identityScopeFilter),
      db
        .select({ deltaWarga: sql<number>`count(*)::int` })
        .from(citizen)
        .where(and(eq(citizen.isArchived, false), sql`${citizen.createdAt} >= now() - interval '7 days'`, scopeFilter)),
      db
        .select({ deltaKK: sql<number>`count(*)::int` })
        .from(household)
        .where(and(eq(household.status, "ACTIVE"), sql`${household.createdAt} >= now() - interval '7 days'`, householdScopeFilter)),
      db
        .select({ deltaMutasi: sql<number>`count(*)::int` })
        .from(mutation)
        .innerJoin(citizen, eq(citizen.id, mutation.citizenId))
        .where(and(eq(citizen.isArchived, false), sql`${mutation.createdAt} >= now() - interval '7 days'`, scopeFilter)),
      db
        .select({
          id: adminActivityLog.id,
          action: adminActivityLog.action,
          entityType: adminActivityLog.entityType,
          entityId: adminActivityLog.entityId,
          createdAt: adminActivityLog.createdAt,
          actorName: user.name,
          actorRole: user.role,
          actorUsername: user.username,
          actorDisplayUsername: user.displayUsername,
        })
        .from(adminActivityLog)
        .innerJoin(user, eq(user.id, adminActivityLog.adminId))
        .orderBy(sql`${adminActivityLog.createdAt} desc`)
        .limit(50),
      db
        .select({
          id: aspiration.id,
          title: aspiration.title,
          category: aspiration.category,
          status: aspiration.status,
          createdAt: aspiration.createdAt,
        })
        .from(aspiration)
        .innerJoin(userIdentity, eq(userIdentity.userId, aspiration.userId))
        .where(identityScopeFilter)
        .orderBy(sql`${aspiration.createdAt} desc`)
        .limit(20),
    ]);

    const dW = Number(deltaWarga || 0);
    const dK = Number(deltaKK || 0);
    const dM = Number(deltaMutasi || 0);

    const latestActivities = [
      ...latestLogRows.map((row) => ({
        id: row.id,
        title: row.action,
        subtitle: `${row.actorName} [${getRoleLabel({
          role: row.actorRole,
          username: row.actorUsername,
          displayUsername: row.actorDisplayUsername,
        })}]${row.entityId ? ` - ${row.entityId}` : ""}`,
        time: row.createdAt.toISOString(),
        action: row.action,
        entityType: row.entityType,
      })),
      ...latestAspirationRows.map((row) => ({
        id: `aspiration-${row.id}`,
        title: row.title,
        subtitle: `Aduan warga${row.category ? ` - ${row.category}` : ""}`,
        time: row.createdAt.toISOString(),
        action: "Aduan warga masuk",
        entityType: "ASPIRATION",
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 50);

    const payload = {
      success: true as const,
      data: {
        stats: {
          totalWarga: liveStats.totalWarga,
          totalKK: liveStats.totalKK,
          totalMutasi: liveStats.totalMutasi,
          pendingRequests: liveStats.pendingRequests,
          ...(dW > 0 ? { deltaWarga: dW } : {}),
          ...(dK > 0 ? { deltaKK: dK } : {}),
          ...(dM > 0 ? { deltaMutasi: dM } : {}),
        },
        latestActivities,
        notificationBadges: {
          pendingVerifications: badgeStats.pendingVerifications,
          pendingRequests: liveStats.pendingRequests,
          pendingMutations: badgeStats.pendingMutations,
          pendingAspirations: badgeStats.pendingAspirations,
          pendingBarangHilang: badgeStats.pendingBarangHilang,
        },
      },
    };
    return ok(c, payload.data);
  });
