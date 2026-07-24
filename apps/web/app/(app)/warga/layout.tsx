import { eq } from "drizzle-orm";

import WargaShellClient from "./_components/warga-shell-client";
import { getIdentityOrNull, requireSession } from "@/lib/auth-server";
import { getDb } from "@/lib/db";
import { citizen, householdMember } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

async function checkHasKk(userId: string): Promise<boolean> {
  try {
    const db = getDb();
    const [citizenRow] = await db
      .select({ id: citizen.id })
      .from(citizen)
      .where(eq(citizen.userId, userId))
      .limit(1);
    if (!citizenRow) return false;
    const [membership] = await db
      .select({ id: householdMember.id })
      .from(householdMember)
      .where(eq(householdMember.citizenId, citizenRow.id))
      .limit(1);
    return Boolean(membership);
  } catch {
    return false;
  }
}

export default async function WargaLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const identity = await getIdentityOrNull();
  const hasKk = await checkHasKk(session.user.id);

  return (
    <WargaShellClient
      identity={{
        userId: session.user.id,
        userName: identity?.userName || session.user.name,
        userEmail: identity?.userEmail || session.user.email,
        maskedNik: identity?.maskedNik ?? "",
        verificationStatus: identity?.verificationStatus ?? "NONE",
        rejectionReason: identity?.rejectionReason,
        hasKk,
        rt: identity?.rt ?? null,
        rw: identity?.rw ?? null,
      }}
    >
      {children}
    </WargaShellClient>
  );
}
