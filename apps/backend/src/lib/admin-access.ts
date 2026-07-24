import { eq, inArray, SQL, Column } from "drizzle-orm";

type AdminIdentity = {
  name: string;
  email: string;
  username: string;
  role: string;
  displayUsername?: string | null;
  accessScope?: "RW" | "RT" | null;
  managedRtCodes?: string[] | null;
};

function normalizeRtCode(value?: string | null) {
  if (!value) return null;
  const match = value.match(/rt[-_ ]?(\d{1,3})/i) || value.match(/(\d{1,3})/);
  if (!match?.[1]) return null;
  return match[1].padStart(2, "0");
}

export const ADMIN_RT_OPTIONS = ["01", "02", "03", "04"] as const;
const ADMIN_RT_SET = new Set<string>(ADMIN_RT_OPTIONS);

export function normalizeManagedRtCodes(values?: string[] | null) {
  if (!values?.length) return [];
  return [
    ...new Set(
      values
        .map((value) => normalizeRtCode(value))
        .filter((value): value is string => value !== null)
        .filter((value) => ADMIN_RT_SET.has(value)),
    ),
  ].sort();
}

function getLegacyRtCodeFromAdmin(identity: Pick<AdminIdentity, "role" | "username" | "displayUsername">) {
  if (identity.role !== "ADMIN") return null;
  return normalizeRtCode(identity.displayUsername) || normalizeRtCode(identity.username);
}

export function getManagedRtCodesFromAdmin(identity: Pick<AdminIdentity, "role" | "username" | "displayUsername" | "accessScope" | "managedRtCodes">) {
  const explicitRtCodes = normalizeManagedRtCodes(identity.managedRtCodes);
  if (explicitRtCodes.length > 0) return explicitRtCodes;

  const legacyRtCode = getLegacyRtCodeFromAdmin(identity);
  return legacyRtCode ? [legacyRtCode] : [];
}

export function getRtCodeFromAdmin(identity: Pick<AdminIdentity, "role" | "username" | "displayUsername" | "accessScope" | "managedRtCodes">) {
  return getManagedRtCodesFromAdmin(identity)[0] ?? null;
}

export function getAdminScope(identity: Pick<AdminIdentity, "role" | "accessScope" | "managedRtCodes" | "username" | "displayUsername">) {
  if (identity.accessScope === "RW" || identity.accessScope === "RT") return identity.accessScope;
  if (identity.role === "SUPER_ADMIN") return "RW" as const;
  if (identity.role === "ADMIN") return "RT" as const;
  return null;
}

export function getRoleLabel(identity: Pick<AdminIdentity, "role" | "username" | "displayUsername" | "accessScope" | "managedRtCodes">) {
  const scope = getAdminScope(identity);
  if (scope === "RW") return "Admin RW";
  if (scope === "RT") {
    const rtCodes = getManagedRtCodesFromAdmin(identity);
    return rtCodes.length > 0 ? `Admin RT ${rtCodes.map((code) => `RT ${code}`).join(", ")}` : "Admin RT";
  }
  return "User";
}

export function getDisplayName(identity: Pick<AdminIdentity, "name" | "role" | "username" | "displayUsername" | "accessScope" | "managedRtCodes">) {
  const roleLabel = getRoleLabel(identity);
  return `${identity.name} [${roleLabel}]`;
}

export function buildAdminUsername(input: { accessScope: "RW" | "RT"; managedRtCodes: string[] }) {
  const suffix = Math.random().toString(36).slice(2, 6);
  if (input.accessScope === "RW") return `adminrw${suffix}`;
  const primaryRtCode = input.managedRtCodes[0] ?? "00";
  return `adminrt${primaryRtCode}${suffix}`;
}

export function buildAdminDisplayUsername(input: { accessScope: "RW" | "RT"; managedRtCodes: string[] }) {
  if (input.accessScope === "RW") return "admin-rw";
  return `admin-${input.managedRtCodes.map((code) => `rt-${code}`).join("-")}`;
}

export function buildScopeFilter(
  sessionUser: { role: string; username?: string; displayUsername?: string | null; accessScope?: string | null; managedRtCodes?: string[] | null },
  column: Column,
): SQL | undefined {
  const identity = {
    role: sessionUser.role,
    username: sessionUser.username ?? "",
    displayUsername: sessionUser.displayUsername,
    accessScope: sessionUser.accessScope as "RW" | "RT" | null | undefined,
    managedRtCodes: sessionUser.managedRtCodes,
  };
  const scope = getAdminScope(identity);
  if (scope === "RW" || scope === null) return undefined;
  const rtCodes = getManagedRtCodesFromAdmin(identity);
  if (rtCodes.length === 0) return undefined;
  return inArray(column, rtCodes);
}

export function isRtInScope(
  sessionUser: { role?: string; username?: string; displayUsername?: string | null; accessScope?: string | null; managedRtCodes?: string[] | null; adminRole?: string; adminAccessScope?: string | null; adminManagedRtCodes?: string[] | null; adminUsername?: string; adminDisplayUsername?: string | null },
  rtCode: string,
): boolean {
  const identity = {
    role: sessionUser.adminRole ?? sessionUser.role ?? "",
    username: sessionUser.adminUsername ?? sessionUser.username ?? "",
    displayUsername: sessionUser.adminDisplayUsername ?? sessionUser.displayUsername,
    accessScope: (sessionUser.adminAccessScope ?? sessionUser.accessScope) as "RW" | "RT" | null | undefined,
    managedRtCodes: sessionUser.adminManagedRtCodes ?? sessionUser.managedRtCodes,
  };
  const scope = getAdminScope(identity);
  if (scope === "RW" || scope === null) return true;
  const rtCodes = getManagedRtCodesFromAdmin(identity);
  if (rtCodes.length === 0) return true;
  return rtCodes.includes(rtCode);
}
