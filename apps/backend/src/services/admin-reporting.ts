import { and, eq, sql, SQL } from "drizzle-orm";

import { aspiration, barangHilang, citizen, getDb, household, mutation, serviceRequest, userIdentity } from "@abdimas/db";

type ReportFilter = {
  tahun?: number;
  bulan?: number;
  rt?: string;
};

// Single source of truth for the "usia produktif" range (BPS: 18-59 inclusive).
// Used everywhere that computes children / productive-age / seniors buckets.
export const PRODUCTIVE_AGE_MIN = 18;
export const PRODUCTIVE_AGE_MAX = 59;

// Age computed at day precision (matches SQL age()); avoids off-by-one vs
// naive currentYear - birthYear when the birthday hasn't passed yet.
function computeAgeYears(birthDate: string | Date | null | undefined): number {
  if (!birthDate) return -1;
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return -1;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years;
}

type CanonicalStats = {
  totalWarga: number;
  totalKK: number;
  totalMutasi: number;
  pendingRequests: number;
  totalMeninggal: number;
  totalBalita: number;
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

type DistributionItem = {
  label: string;
  value: number;
  share: number;
};

type InfographicData = {
  totalCitizens: number;
  productiveAge: number;
  children: number;
  seniors: number;
  occupation: DistributionItem[];
  education: DistributionItem[];
  religion: DistributionItem[];
  maritalStatus: DistributionItem[];
  bloodType: DistributionItem[];
  residentStatus: DistributionItem[];
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

export function buildCanonicalCitizenWhere(filter: ReportFilter = {}, scopeFilter?: SQL) {
  return and(
    eq(citizen.isArchived, false),
    filter.rt ? eq(citizen.rt, filter.rt) : undefined,
    buildTimestampFilter(citizen.createdAt, filter),
    scopeFilter,
  );
}

export function buildCanonicalHouseholdWhere(filter: ReportFilter = {}, scopeFilter?: SQL) {
  return and(
    eq(household.status, "ACTIVE"),
    filter.rt ? eq(household.rt, filter.rt) : undefined,
    buildTimestampFilter(household.createdAt, filter),
    scopeFilter,
  );
}

export function buildCanonicalMutationWhere(filter: ReportFilter = {}) {
  return filter.tahun || filter.bulan
    ? and(buildDateFilter(mutation.mutationDate, filter), sql`${mutation.mutationDate} is not null`)
    : undefined;
}

export async function getCanonicalLiveStats(
  scopeFilter?: SQL,
  filter: ReportFilter = {},
  pendingRequestsScopeFilter?: SQL,
): Promise<CanonicalStats> {
  const db = getDb();
  const citizenWhere = buildCanonicalCitizenWhere(filter, scopeFilter);
  const householdWhere = buildCanonicalHouseholdWhere(filter, scopeFilter);
  const mutationDateFilter = buildDateFilter(mutation.mutationDate, filter);
  const [[{ totalWarga }], [{ totalKK }], [{ totalMutasi }], [{ pendingRequests }], [{ totalMeninggal }], [{ totalBalita }]] = await Promise.all([
    db.select({ totalWarga: sql<number>`count(*)::int` }).from(citizen).where(citizenWhere),
    db
      .select({ totalKK: sql<number>`count(*)::int` })
      .from(household)
      .where(householdWhere),
    db
      .select({ totalMutasi: sql<number>`count(*)::int` })
      .from(mutation)
      .innerJoin(citizen, eq(citizen.id, mutation.citizenId))
      .where(and(eq(citizen.isArchived, false), scopeFilter, mutationDateFilter, filter.rt ? eq(citizen.rt, filter.rt) : undefined)),
    db
      .select({ pendingRequests: sql<number>`count(*)::int` })
      .from(serviceRequest)
      .innerJoin(userIdentity, eq(userIdentity.userId, serviceRequest.requestedBy))
      .where(and(
        eq(serviceRequest.status, "PENDING"),
        pendingRequestsScopeFilter,
        filter.rt ? eq(userIdentity.rt, filter.rt) : undefined,
        buildTimestampFilter(serviceRequest.createdAt, filter),
      )),
    db
      .select({ totalMeninggal: sql<number>`count(*)::int` })
      .from(mutation)
      .innerJoin(citizen, eq(citizen.id, mutation.citizenId))
      .where(and(
        eq(mutation.type, "DEATH"),
        eq(citizen.isArchived, false),
        scopeFilter,
        mutationDateFilter,
        filter.rt ? eq(citizen.rt, filter.rt) : undefined,
      )),
    db
      .select({ totalBalita: sql<number>`count(*)::int` })
      .from(citizen)
      .where(and(
        eq(citizen.isArchived, false),
        sql`extract(year from age(current_date, ${citizen.birthDate})) <= 5`,
        scopeFilter,
        filter.rt ? eq(citizen.rt, filter.rt) : undefined,
        buildTimestampFilter(citizen.createdAt, filter),
      )),
  ]);

  return {
    totalWarga: Number(totalWarga || 0),
    totalKK: Number(totalKK || 0),
    totalMutasi: Number(totalMutasi || 0),
    pendingRequests: Number(pendingRequests || 0),
    totalMeninggal: Number(totalMeninggal || 0),
    totalBalita: Number(totalBalita || 0),
  };
}

export async function getCanonicalDashboardBadges(
  scopeFilter?: SQL,
  pendingRequestsScopeFilter?: SQL,
) {
  const db = getDb();
  const [
    [{ pendingVerifications }],
    [{ pendingMutationsCanonical }],
    [{ pendingMutationsRequests }],
    [{ pendingAspirations }],
    [{ pendingBarangHilang }],
  ] = await Promise.all([
    db
      .select({ pendingVerifications: sql<number>`count(*)::int` })
      .from(userIdentity)
      .where(and(eq(userIdentity.verificationStatus, "PENDING"), pendingRequestsScopeFilter)),
    db
      .select({ pendingMutationsCanonical: sql<number>`count(*)::int` })
      .from(mutation)
      .innerJoin(citizen, eq(citizen.id, mutation.citizenId))
      .where(and(eq(mutation.status, "PENDING"), eq(citizen.isArchived, false), scopeFilter)),
    // Warga-submitted MUTATION_IN/OUT requests live in service_request, not the
    // canonical `mutation` table, so they must be counted separately or the badge
    // silently misses them (audit gap #2, 2026-07-25).
    db
      .select({ pendingMutationsRequests: sql<number>`count(*)::int` })
      .from(serviceRequest)
      .innerJoin(userIdentity, eq(userIdentity.userId, serviceRequest.requestedBy))
      .where(and(
        eq(serviceRequest.status, "PENDING"),
        sql`${serviceRequest.type} in ('MUTATION_IN','MUTATION_OUT')`,
        pendingRequestsScopeFilter,
      )),
    db
      .select({ pendingAspirations: sql<number>`count(*)::int` })
      .from(aspiration)
      .innerJoin(userIdentity, eq(userIdentity.userId, aspiration.userId))
      .where(and(eq(aspiration.status, "SUBMITTED"), pendingRequestsScopeFilter)),
    db
      .select({ pendingBarangHilang: sql<number>`count(*)::int` })
      .from(barangHilang)
      .innerJoin(userIdentity, eq(userIdentity.userId, barangHilang.reporterId))
      .where(and(
        sql`${barangHilang.status} in ('pending_verification','in_verification')`,
        pendingRequestsScopeFilter,
      )),
  ]);

  return {
    pendingVerifications: Number(pendingVerifications || 0),
    pendingMutations: Number(pendingMutationsCanonical || 0) + Number(pendingMutationsRequests || 0),
    pendingAspirations: Number(pendingAspirations || 0),
    pendingBarangHilang: Number(pendingBarangHilang || 0),
  };
}

export async function getFilteredRtBreakdown(filter: ReportFilter = {}, scopeFilter?: SQL): Promise<RtBreakdownRow[]> {
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
      produktif: sql<number>`count(*) filter (where extract(year from age(current_date, ${citizen.birthDate})) between ${PRODUCTIVE_AGE_MIN} and ${PRODUCTIVE_AGE_MAX})::int`,
    })
    .from(citizen)
    .where(buildCanonicalCitizenWhere(filter, scopeFilter))
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

export async function getFilteredDemographics(filter: ReportFilter = {}, scopeFilter?: SQL): Promise<DemographicsData> {
  const rows = await getDb()
    .select({
      gender: citizen.gender,
      birthDate: citizen.birthDate,
    })
    .from(citizen)
    .where(buildCanonicalCitizenWhere(filter, scopeFilter));

  const ageGroups: DemographicsData["ageGroups"] = [
    { label: "0-12", value: 0 },
    { label: "13-17", value: 0 },
    { label: "18-35", value: 0 },
    { label: "36-59", value: 0 },
    { label: "60+", value: 0 },
  ];

  let male = 0;
  let female = 0;

  for (const row of rows) {
    const age = computeAgeYears(row.birthDate);
    if (age < 0) {
      // no valid birthDate → skip age bucket but still count gender below
    } else if (age <= 12) ageGroups[0].value += 1;
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

function buildDistribution(values: Array<string | null | undefined>, fallback: string, fixedLabels?: string[]) {
  const total = values.length || 1;
  const counts = new Map<string, number>();

  if (fixedLabels) {
    for (const label of fixedLabels) {
      counts.set(label.toUpperCase(), 0);
    }
  }

  for (const rawValue of values) {
    let label = rawValue?.trim() || fallback;
    if (label !== fallback) {
      label = label.toUpperCase();
    }
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({
      label,
      value,
      share: Number(((value / total) * 100).toFixed(1)),
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}

export async function getFilteredInfographicData(filter: ReportFilter = {}, scopeFilter?: SQL): Promise<InfographicData> {
  const rows = await getDb()
    .select({
      birthDate: citizen.birthDate,
      occupation: citizen.occupation,
      education: citizen.education,
      religion: citizen.religion,
      maritalStatus: citizen.maritalStatus,
      bloodType: citizen.bloodType,
      status: citizen.status,
    })
    .from(citizen)
    .where(buildCanonicalCitizenWhere(filter, scopeFilter));

  let productiveAge = 0;
  let children = 0;
  let seniors = 0;

  for (const row of rows) {
    const age = computeAgeYears(row.birthDate);
    if (age < 0) continue;
    if (age < PRODUCTIVE_AGE_MIN) children += 1;
    else if (age <= PRODUCTIVE_AGE_MAX) productiveAge += 1;
    else seniors += 1;
  }

  return {
    totalCitizens: rows.length,
    productiveAge,
    children,
    seniors,
    occupation: buildDistribution(rows.map((row) => row.occupation), "Belum Diisi"),
    education: buildDistribution(rows.map((row) => row.education), "Belum Diisi"),
    religion: buildDistribution(rows.map((row) => row.religion), "Belum Diisi", ["ISLAM", "KRISTEN", "KATHOLIK", "HINDU", "BUDDHA", "KONGHUCU"]),
    maritalStatus: buildDistribution(rows.map((row) => row.maritalStatus), "Belum Diisi"),
    bloodType: buildDistribution(rows.map((row) => row.bloodType), "Tidak Diketahui", ["A", "B", "AB", "O", "TIDAK DIKETAHUI"]),
    residentStatus: buildDistribution(rows.map((row) => row.status), "Belum Diisi", ["PENDUDUK_TETAP", "NGEKOST"]),
  };
}

export async function getFilteredPendingRequests(
  filter: ReportFilter = {},
  pendingRequestsScopeFilter?: SQL,
) {
  const rows = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(serviceRequest)
    .innerJoin(userIdentity, eq(userIdentity.userId, serviceRequest.requestedBy))
    .where(and(
      eq(serviceRequest.status, "PENDING"),
      buildTimestampFilter(serviceRequest.createdAt, filter),
      pendingRequestsScopeFilter,
      filter.rt ? eq(userIdentity.rt, filter.rt) : undefined,
    ));
  return Number(rows[0]?.total || 0);
}
