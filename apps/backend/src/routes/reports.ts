import PDFDocument from "pdfkit";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import * as XLSX from "xlsx";
import { z } from "zod";

import { aspiration, citizen, getDb, household, mutation, serviceRequest } from "@abdimas/db";
import {
  citizenListQuerySchema,
  citizenListResponseSchema,
  reportDemographicsResponseSchema,
  reportCitizenDrilldownQuerySchema,
  reportFilterSchema,
  reportInfographicResponseSchema,
  reportSummaryResponseSchema,
  rtBreakdownResponseSchema,
} from "@abdimas/contracts";

import { buildPageMeta, getOffset } from "../lib/pagination.js";
import { createRateLimitMiddleware } from "../lib/rate-limit.js";
import { ok } from "../lib/response.js";
import { toIso } from "../lib/serialize.js";
import { parseQuery, sanitizeSearchTerm } from "../lib/validation.js";
import { adminMiddleware } from "../middleware/auth.js";
import {
  buildCanonicalCitizenWhere,
  buildCanonicalMutationWhere,
  buildDateFilter,
  buildTimestampFilter,
  getCanonicalDashboardBadges,
  getCanonicalLiveStats,
  getFilteredDemographics,
  getFilteredInfographicData,
  getFilteredPendingRequests,
  getFilteredRtBreakdown,
} from "../services/admin-reporting.js";

type ReportFilter = z.infer<typeof reportFilterSchema>;

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

function parseReportFilter(c: { req: { query: (key: string) => string | undefined } }) {
  return parseQuery(
    {
      tahun: c.req.query("tahun") || undefined,
      bulan: c.req.query("bulan") || undefined,
      rt: c.req.query("rt") || undefined,
    },
    reportFilterSchema,
  );
}

function formatReportPeriod(filter: ReportFilter) {
  const segments: string[] = [];
  if (filter.bulan && MONTH_LABELS[filter.bulan - 1]) segments.push(MONTH_LABELS[filter.bulan - 1]);
  if (filter.tahun) segments.push(String(filter.tahun));
  if (filter.rt) segments.push(`RT ${filter.rt}`);
  return segments.join(" - ") || "Semua Periode";
}

function buildExportFilename(prefix: string, filter: ReportFilter, ext: "csv" | "pdf" | "xlsx") {
  const parts = [prefix];
  if (filter.tahun) parts.push(String(filter.tahun));
  if (filter.bulan) parts.push(String(filter.bulan).padStart(2, "0"));
  if (filter.rt) parts.push(`rt-${filter.rt}`);
  return `${parts.join("-").toLowerCase()}.${ext}`;
}

function toCsvValue(value: unknown) {
  const normalized = String(value ?? "").replace(/"/g, '""');
  return `"${normalized}"`;
}

const CSV_DELIMITER = ";";

export const reportsRoutes = new Hono<{ Variables: { sessionUser: { id: string; role: string } } }>()
  .use("*", adminMiddleware)
  .get("/summary", async (c) => {
    const [liveStats, badgeStats] = await Promise.all([getCanonicalLiveStats(), getCanonicalDashboardBadges()]);
    const payload = {
      success: true as const,
      data: {
        stats: liveStats,
        latestActivities: [],
        notificationBadges: {
          pendingVerifications: badgeStats.pendingVerifications,
          pendingRequests: liveStats.pendingRequests,
          pendingMutations: badgeStats.pendingMutations,
          pendingAspirations: badgeStats.pendingAspirations,
        },
      },
    };
    reportSummaryResponseSchema.parse(payload);
    return ok(c, payload.data);
  })
  .get("/rt-breakdown", async (c) => {
    const filter = parseReportFilter(c);
    const payload = {
      success: true as const,
      data: await getFilteredRtBreakdown(filter),
    };
    rtBreakdownResponseSchema.parse(payload);
    return ok(c, payload.data);
  })
  .get("/demographics", async (c) => {
    const filter = parseReportFilter(c);
    const payload = {
      success: true as const,
      data: await getFilteredDemographics(filter),
    };
    reportDemographicsResponseSchema.parse(payload);
    return ok(c, payload.data);
  })
  .get("/analytics", async (c) => {
    const filter = parseReportFilter(c);
    const payload = {
      success: true as const,
      data: await getFilteredInfographicData(filter),
    };
    reportInfographicResponseSchema.parse(payload);
    return ok(c, payload.data);
  })
  .get("/citizens", async (c) => {
    const parsed = reportCitizenDrilldownQuerySchema.parse({
      page: c.req.query("page"),
      limit: c.req.query("limit"),
      tahun: c.req.query("tahun"),
      bulan: c.req.query("bulan"),
      q: sanitizeSearchTerm(c.req.query("q") || undefined),
    });
    const filterRt = c.req.query("rt");
    
    const where = parsed.q
      ? and(
          buildCanonicalCitizenWhere({ tahun: parsed.tahun, bulan: parsed.bulan, rt: filterRt }),
          sql`(${citizen.name} ilike ${`%${parsed.q}%`} or ${citizen.nik} ilike ${`%${parsed.q}%`})`,
        )
      : buildCanonicalCitizenWhere({ tahun: parsed.tahun, bulan: parsed.bulan, rt: filterRt });
      
    const db = getDb();
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(citizen)
      .where(where);
    const rows = await db
      .select()
      .from(citizen)
      .where(where)
      .orderBy(citizen.name)
      .limit(parsed.limit)
      .offset(getOffset(parsed.page, parsed.limit));

    const meta = buildPageMeta({ page: parsed.page, limit: parsed.limit, total: Number(total || 0) });

    const payload = {
      success: true as const,
      data: rows.map((row) => ({
        id: row.id,
        userId: row.userId ?? null,
        nik: row.nik,
        name: row.name,
        gender: row.gender,
        birthPlace: row.birthPlace,
        birthDate: row.birthDate,
        religion: row.religion,
        maritalStatus: row.maritalStatus,
        occupation: row.occupation,
        education: row.education,
        bloodType: row.bloodType ?? null,
        address: row.address,
        rt: row.rt,
        rw: row.rw,
        status: row.status,
        createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
        updatedAt: toIso(row.updatedAt) ?? new Date().toISOString(),
      })),
      meta,
    };
    citizenListResponseSchema.parse(payload);
    return ok(c, payload.data, meta);
  })
  .get("/rt/:rtId/citizens", async (c) => {
    const parsed = reportCitizenDrilldownQuerySchema.parse({
      page: c.req.query("page"),
      limit: c.req.query("limit"),
      tahun: c.req.query("tahun"),
      bulan: c.req.query("bulan"),
      q: sanitizeSearchTerm(c.req.query("q") || undefined),
    });
    const rtId = c.req.param("rtId").replace(/^RT\s*/i, "").padStart(2, "0");
    const where = parsed.q
      ? and(
          buildCanonicalCitizenWhere({ tahun: parsed.tahun, bulan: parsed.bulan, rt: rtId }),
          sql`(${citizen.name} ilike ${`%${parsed.q}%`} or ${citizen.nik} ilike ${`%${parsed.q}%`})`,
        )
      : buildCanonicalCitizenWhere({ tahun: parsed.tahun, bulan: parsed.bulan, rt: rtId });
    const db = getDb();
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(citizen)
      .where(where);
    const rows = await db
      .select()
      .from(citizen)
      .where(where)
      .orderBy(citizen.name)
      .limit(parsed.limit)
      .offset(getOffset(parsed.page, parsed.limit));

    const meta = buildPageMeta({ page: parsed.page, limit: parsed.limit, total: Number(total || 0) });

    const payload = {
      success: true as const,
      data: rows.map((row) => ({
        id: row.id,
        userId: row.userId ?? null,
        nik: row.nik,
        name: row.name,
        gender: row.gender,
        birthPlace: row.birthPlace,
        birthDate: row.birthDate,
        religion: row.religion,
        maritalStatus: row.maritalStatus,
        occupation: row.occupation,
        education: row.education,
        bloodType: row.bloodType ?? null,
        address: row.address,
        rt: row.rt,
        rw: row.rw,
        status: row.status,
        createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
        updatedAt: toIso(row.updatedAt) ?? new Date().toISOString(),
      })),
      meta,
    };
    citizenListResponseSchema.parse(payload);
    return ok(c, payload.data, meta);
  })
  .get("/export/csv", createRateLimitMiddleware({ key: "reports-export", limit: 5, windowMs: 60_000 }), async (c) => {
    const filter = parseReportFilter(c);
    const rows = await getDb()
      .select()
      .from(citizen)
      .where(buildCanonicalCitizenWhere(filter))
      .orderBy(citizen.rt, citizen.rw, citizen.name);

    const headers = ["NIK", "Nama", "Jenis Kelamin", "Tanggal Lahir", "RT", "RW", "Status", "Alamat", "Pekerjaan"];
    const csvRows = [
      "sep=;",
      headers.map(toCsvValue).join(CSV_DELIMITER),
      ...rows.map((row) =>
        [
          row.nik,
          row.name,
          row.gender,
          row.birthDate,
          row.rt,
          row.rw,
          row.status,
          row.address,
          row.occupation,
        ].map(toCsvValue).join(CSV_DELIMITER),
      ),
    ];

    c.header("content-type", "text/csv; charset=utf-8");
    c.header("content-disposition", `attachment; filename="${buildExportFilename("report-warga", filter, "csv")}"`);
    return c.body(`\uFEFF${csvRows.join("\n")}`);
  })
  .get("/export/xlsx", createRateLimitMiddleware({ key: "reports-export", limit: 5, windowMs: 60_000 }), async (c) => {
    const filter = parseReportFilter(c);
    const rows = await getDb()
      .select()
      .from(citizen)
      .where(buildCanonicalCitizenWhere(filter))
      .orderBy(citizen.rt, citizen.name);
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        NIK: row.nik,
        Nama: row.name,
        RT: row.rt,
        RW: row.rw,
        Status: row.status,
        Alamat: row.address,
        Pekerjaan: row.occupation,
      })),
    );
    XLSX.utils.book_append_sheet(workbook, sheet, "Citizens");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    c.header("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    c.header("content-disposition", `attachment; filename="${buildExportFilename("report-warga", filter, "xlsx")}"`);
    return c.body(buffer);
  })
  .get("/export/pdf", createRateLimitMiddleware({ key: "reports-export", limit: 5, windowMs: 60_000 }), async (c) => {
    const filter = parseReportFilter(c);
    const [summary, demographics, rtBreakdown, pendingRequests] = await Promise.all([
      getCanonicalLiveStats(),
      getFilteredDemographics(filter),
      getFilteredRtBreakdown(filter),
      getFilteredPendingRequests(filter),
    ]);
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const statGap = 12;
    const statWidth = (pageWidth - statGap) / 2;

    const drawStatCard = (x: number, y: number, label: string, value: number) => {
      doc.save();
      doc.roundedRect(x, y, statWidth, 62, 12).fillAndStroke("#EFF6FF", "#BFDBFE");
      doc.fillColor("#475569").fontSize(10).text(label, x + 12, y + 12, { width: statWidth - 24 });
      doc.fillColor("#1D4ED8").fontSize(20).text(String(value), x + 12, y + 28, { width: statWidth - 24 });
      doc.restore();
    };

    doc.fillColor("#0F172A").fontSize(21).text("Laporan Data Warga RW");
    doc.fillColor("#475569").fontSize(11).text(`Periode: ${formatReportPeriod(filter)}`);
    doc.text(`Diunduh: ${new Date().toLocaleString("id-ID")}`);

    let y = doc.y + 18;
    drawStatCard(left, y, "Total Warga", summary.totalWarga);
    drawStatCard(left + statWidth + statGap, y, "Total KK", summary.totalKK);
    y += 74;
    drawStatCard(left, y, "Total Mutasi", summary.totalMutasi);
    drawStatCard(left + statWidth + statGap, y, "Permohonan Pending", pendingRequests);

    y += 88;
    doc.fillColor("#0F172A").fontSize(14).text("Ringkasan Demografi", left, y);
    y = doc.y + 8;
    doc.fillColor("#334155").fontSize(11).text(`Total Penduduk Tercatat: ${demographics.totalCitizens}`, left, y);
    doc.text(`Laki-laki: ${demographics.gender.male} | Perempuan: ${demographics.gender.female}`, left, doc.y + 4);
    doc.text(
      demographics.ageGroups.map((group) => `${group.label}: ${group.value}`).join(" | "),
      left,
      doc.y + 4,
      { width: pageWidth },
    );

    y = doc.y + 24;
    doc.fillColor("#0F172A").fontSize(14).text("Rekap RT / RW", left, y);
    y = doc.y + 10;

    const columns = [
      { label: "Wilayah", width: 120 },
      { label: "KK", width: 70 },
      { label: "Warga", width: 80 },
      { label: "Mutasi", width: 80 },
      { label: "Produktif", width: 90 },
    ] as const;

    doc.save();
    doc.roundedRect(left, y, pageWidth, 24, 8).fill("#DBEAFE");
    let headerX = left + 10;
    for (const column of columns) {
      doc.fillColor("#1D4ED8").fontSize(10).text(column.label, headerX, y + 7, { width: column.width });
      headerX += column.width;
    }
    doc.restore();
    y += 30;

    for (const row of rtBreakdown) {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      doc.roundedRect(left, y, pageWidth, 24, 6).fill("#FFFFFF").stroke("#E2E8F0");
      const values = [
        `RT ${row.rt} / RW ${row.rw}`,
        String(row.kk),
        String(row.warga),
        String(row.mutasi),
        String(row.produktif),
      ];
      let rowX = left + 10;
      values.forEach((value, index) => {
        doc.fillColor("#334155").fontSize(10).text(value, rowX, y + 7, { width: columns[index].width });
        rowX += columns[index].width;
      });
      y += 28;
    }
    doc.end();

    const buffer = await finished;
    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${buildExportFilename("report-ringkasan", filter, "pdf")}"`,
      },
    });
  });
