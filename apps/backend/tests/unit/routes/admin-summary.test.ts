import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";

const dbState = vi.hoisted(() => ({
  selectQueue: [] as unknown[][],
}));

const reportingState = vi.hoisted(() => ({
  getCanonicalLiveStats: vi.fn(),
  getCanonicalDashboardBadges: vi.fn(),
}));

vi.mock("@abdimas/db", () => {
  const createSelectChain = () => {
    const chain = {
      from: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(async () => dbState.selectQueue.shift() ?? []),
      then: (resolve: (value: unknown[]) => unknown) =>
        Promise.resolve(dbState.selectQueue.shift() ?? []).then(resolve),
    };

    return chain;
  };

  return {
    getDb: () => ({
      select: vi.fn(() => createSelectChain()),
    }),
    adminActivityLog: {
      id: "adminActivityLog.id",
      action: "adminActivityLog.action",
      entityType: "adminActivityLog.entityType",
      entityId: "adminActivityLog.entityId",
      createdAt: "adminActivityLog.createdAt",
      adminId: "adminActivityLog.adminId",
    },
    aspiration: {
      id: "aspiration.id",
      title: "aspiration.title",
      category: "aspiration.category",
      createdAt: "aspiration.createdAt",
      status: "aspiration.status",
    },
    citizen: {
      isArchived: "citizen.isArchived",
      createdAt: "citizen.createdAt",
    },
    household: {
      status: "household.status",
      createdAt: "household.createdAt",
    },
    mutation: {
      status: "mutation.status",
      createdAt: "mutation.createdAt",
    },
    user: {
      id: "user.id",
      name: "user.name",
      role: "user.role",
      username: "user.username",
      displayUsername: "user.displayUsername",
    },
  };
});

vi.mock("../../../src/services/admin-reporting", () => reportingState);

vi.mock("../../../src/lib/admin-access", () => ({
  getRoleLabel: vi.fn(() => "Admin"),
}));

vi.mock("../../../src/middleware/auth", () => ({
  adminMiddleware: createMiddleware(async (c, next) => {
    c.set("sessionUser", { id: "admin-1", role: "ADMIN" });
    await next();
  }),
}));

const { reportsRoutes } = await import("../../../src/routes/reports");
const { AppError } = await import("../../../src/lib/errors");
const { fail } = await import("../../../src/lib/response");

function createApp(routePrefix: string, route: Hono) {
  const app = new Hono();
  app.onError((error, c) => {
    if (error instanceof AppError) {
      return fail(c, error.code, error.message, error.status);
    }
    if (error instanceof HTTPException) {
      return fail(c, "INTERNAL_ERROR", error.message, error.status);
    }
    return fail(c, "INTERNAL_ERROR", "Internal server error", 500);
  });
  app.route(routePrefix, route);
  return app;
}

beforeEach(() => {
  dbState.selectQueue = [];
  reportingState.getCanonicalLiveStats.mockReset();
  reportingState.getCanonicalDashboardBadges.mockReset();
  reportingState.getCanonicalLiveStats.mockResolvedValue({
    totalWarga: 224,
    totalKK: 63,
    totalMutasi: 15,
    pendingRequests: 4,
  });
  reportingState.getCanonicalDashboardBadges.mockResolvedValue({
    pendingVerifications: 3,
    pendingMutations: 2,
    pendingAspirations: 1,
  });
});

describe("admin summary routes", () => {
  it("reports summary returns canonical live totals even when report filters are present", async () => {
    const app = createApp("/admin/reports", reportsRoutes);
    const response = await app.request("/admin/reports/summary?tahun=2026&bulan=6&rt=01");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        stats: {
          totalWarga: 224,
          totalKK: 63,
          totalMutasi: 15,
          pendingRequests: 4,
        },
      },
    });
    expect(reportingState.getCanonicalLiveStats).toHaveBeenCalledTimes(1);
  });
});
