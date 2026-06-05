import { and, eq, sql } from "drizzle-orm";

import { aspiration, citizen, getDb, household, mutation, serviceRequest, userIdentity } from "@abdimas/db";

type ReportFilter = {
  tahun?: number;
  bulan?: number;
  rt?: string;
};

type CanonicalStats = {
  totalWarga: number;
  totalKK: number;
  totalMutasi: number;
  pendingRequests: number;
};

type RtBreakdownRow = {
  rt: string;
  rw: string;
  kk: number;
  warga: number;
  mutasi: number;
  produktif: number;
};

type DemographicsData = {
  totalCitizens: number;
  ageGroups: Array<{ label: "0-12" | "13-17" | "18-35" | "36-59" | "60+"; value: number }>;
  gender: {
    male: number;
    female: number;
  };
};

export function buildTimestampFilter(column: { name: string }, filter: ReportFilter) {
  const conditions: ReturnType<typeof sql>[] = [];
  if (filter.tahun) conditions.push(sql`extract(year from ${column}) = ${filter.tahun}`);
  if (filter.bulan) conditions.push(sql`extract(month from ${column}) = ${filter.bulan}`);
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function buildDateFilter(column: { name: string }, filter: ReportFilter) {
  const conditions: ReturnType<typeof sql>[] = [];
  if (filter.tahun) conditions.push(sql`extract(year from ${column}) = ${filter.tahun}`);
  if (filter.bulan) conditions.push(sql`extract(month from ${column}) = ${filter.bulan}`);
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function buildCanonicalCitizenWhere(filter: ReportFilter = {}) {
  return and(
    eq(citizen.isArchived, false),
    filter.rt ? eq(citizen.rt, filter.rt) : undefined,
    buildTimestampFilter(citizen.createdAt, filter),
  );
}

export function buildCanonicalHouseholdWhere(filter: ReportFilter = {}) {
  return and(
    eq(household.status, "ACTIVE"),
    filter.rt ? eq(household.rt, filter.rt) : undefined,
    buildTimestampFilter(household.createdAt, filter),
  );
}

export function buildCanonicalMutationWhere(filter: ReportFilter = {}) {
  return filter.tahun || filter.bulan
    ? and(buildDateFilter(mutation.mutationDate, filter), sql`${mutation.mutationDate} is not null`)
    : undefined;
}

export async function getCanonicalLiveStats(): Promise<CanonicalStats> {
  const db = getDb();
  const [[{ totalWarga }], [{ totalKK }], [{ totalMutasi }], [{ pendingRequests }]] = await Promise.all([
    db.select({ totalWarga: sql<number>`count(*)::int` }).from(citizen).where(eq(citizen.isArchived, false)),
    db
      .select({ totalKK: sql<number>`count(*)::int` })
      .from(household)
      .where(eq(household.status, "ACTIVE")),
    db.select({ totalMutasi: sql<number>`count(*)::int` }).from(mutation),
    db
      .select({ pendingRequests: sql<number>`count(*)::int` })
      .from(serviceRequest)
      .where(eq(serviceRequest.status, "PENDING")),
  ]);

  return {
    totalWarga: Number(totalWarga || 0),
    totalKK: Number(totalKK || 0),
    totalMutasi: Number(totalMutasi || 0),
    pendingRequests: Number(pendingRequests || 0),
  };
}

export async function getCanonicalDashboardBadges() {
  const db = getDb();
  const [[{ pendingVerifications }], [{ pendingMutations }], [{ pendingAspirations }]] = await Promise.all([
    db
      .select({ pendingVerifications: sql<number>`count(*)::int` })
      .from(userIdentity)
      .where(eq(userIdentity.verificationStatus, "PENDING")),
    db
      .select({ pendingMutations: sql<number>`count(*)::int` })
      .from(mutation)
      .where(eq(mutation.status, "PENDING")),
    db
      .select({ pendingAspirations: sql<number>`count(*)::int` })
      .from(aspiration)
      .where(eq(aspiration.status, "SUBMITTED")),
  ]);

  return {
    pendingVerifications: Number(pendingVerifications || 0),
    pendingMutations: Number(pendingMutations || 0),
    pendingAspirations: Number(pendingAspirations || 0),
  };
}

export async function getFilteredRtBreakdown(filter: ReportFilter = {}): Promise<RtBreakdownRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      rt: citizen.rt,
      rw: citizen.rw,
      warga: sql<number>`count(*)::int`,
      kk: sql<number>`(
        select count(*)::int from households h
        where h.rt = ${citizen.rt}
          and h.rw = ${citizen.rw}
          and h.status = 'ACTIVE'
          ${filter.tahun ? sql`and extract(year from h.created_at) = ${filter.tahun}` : sql``}
          ${filter.bulan ? sql`and extract(month from h.created_at) = ${filter.bulan}` : sql``}
      )`,
      mutasi: sql<number>`(
        select count(*)::int from mutations m
        inner join citizens c2 on c2.id = m.citizen_id
        where c2.rt = ${citizen.rt}
          and c2.rw = ${citizen.rw}
          and c2.is_archived = false
          ${filter.tahun ? sql`and extract(year from m.mutation_date) = ${filter.tahun}` : sql``}
          ${filter.bulan ? sql`and extract(month from m.mutation_date) = ${filter.bulan}` : sql``}
      )`,
      produktif: sql<number>`count(*) filter (where extract(year from age(current_date, ${citizen.birthDate})) between 16 and 60)::int`,
    })
    .from(citizen)
    .where(buildCanonicalCitizenWhere(filter))
    .groupBy(citizen.rt, citizen.rw)
    .orderBy(citizen.rt);

  return rows.map((row) => ({
    rt: row.rt,
    rw: row.rw,
    kk: Number(row.kk || 0),
    warga: Number(row.warga || 0),
    mutasi: Number(row.mutasi || 0),
    produktif: Number(row.produktif || 0),
  }));
}

export async function getFilteredDemographics(filter: ReportFilter = {}): Promise<DemographicsData> {
  const rows = await getDb()
    .select({
      gender: citizen.gender,
      birthDate: citizen.birthDate,
    })
    .from(citizen)
    .where(buildCanonicalCitizenWhere(filter));

  const ageGroups: DemographicsData["ageGroups"] = [
    { label: "0-12", value: 0 },
    { label: "13-17", value: 0 },
    { label: "18-35", value: 0 },
    { label: "36-59", value: 0 },
    { label: "60+", value: 0 },
  ];

  let male = 0;
  let female = 0;
  const currentYear = new Date().getFullYear();

  for (const row of rows) {
    const age = currentYear - new Date(row.birthDate).getFullYear();
    if (age <= 12) ageGroups[0].value += 1;
    else if (age <= 17) ageGroups[1].value += 1;
    else if (age <= 35) ageGroups[2].value += 1;
    else if (age <= 59) ageGroups[3].value += 1;
    else ageGroups[4].value += 1;

    if (row.gender === "L") male += 1;
    if (row.gender === "P") female += 1;
  }

  return {
    totalCitizens: rows.length,
    ageGroups,
    gender: { male, female },
  };
}

export async function getFilteredPendingRequests(filter: ReportFilter = {}) {
  const rows = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(serviceRequest)
    .where(and(eq(serviceRequest.status, "PENDING"), buildTimestampFilter(serviceRequest.createdAt, filter)));
  return Number(rows[0]?.total || 0);
}
