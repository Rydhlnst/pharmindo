import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";

import { getDb } from "@/lib/db";
import { userIdentity } from "@/lib/db/schema";
import auth from "@/lib/auth";
import { env } from "@/lib/env";
import { encryptNik, hashNik, nikParts, normalizeNik, maskNikFromParts } from "@/lib/security/nik";

const postSchema = z.object({
  nik: z.string().trim().min(16).max(16),
});

export async function POST(req: Request) {
  const db = getDb();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
  }

  let nik: string;
  try {
    nik = normalizeNik(parsed.data.nik);
  } catch {
    return NextResponse.json({ error: "NIK harus 16 digit" }, { status: 400 });
  }

  try {
    const nikHash = hashNik(nik, env.NIK_HASH_PEPPER());
    const nikEncrypted = encryptNik(nik, env.NIK_ENCRYPTION_KEY_BASE64());
    const { first4, last4 } = nikParts(nik);

    const [existing] = await db
      .select({ id: userIdentity.id, verificationStatus: userIdentity.verificationStatus })
      .from(userIdentity)
      .where(eq(userIdentity.userId, session.user.id))
      .limit(1);

    if (existing) {
      if (existing.verificationStatus !== "REJECTED") {
        return NextResponse.json({ error: "Identitas akun ini sudah terdaftar" }, { status: 409 });
      }

      // Check if a DIFFERENT user already owns this NIK
      const [takenByOther] = await db
        .select({ id: userIdentity.id })
        .from(userIdentity)
        .where(and(eq(userIdentity.nikHash, nikHash), ne(userIdentity.userId, session.user.id)))
        .limit(1);

      if (takenByOther) {
        return NextResponse.json({ error: "NIK sudah terdaftar oleh akun lain" }, { status: 409 });
      }

      // Delete then re-insert to avoid unique constraint issues on stale rows
      await db.delete(userIdentity).where(eq(userIdentity.userId, session.user.id));
      const [created] = await db
        .insert(userIdentity)
        .values({ userId: session.user.id, nikEncrypted, nikHash, nikFirst4: first4, nikLast4: last4, verificationStatus: "PENDING" })
        .returning();

      return NextResponse.json({
        data: {
          verificationStatus: created.verificationStatus,
          maskedNik: maskNikFromParts(first4, last4),
        },
      });
    }

    // New submission — check NIK not taken by anyone
    const [byNik] = await db
      .select({ id: userIdentity.id })
      .from(userIdentity)
      .where(eq(userIdentity.nikHash, nikHash))
      .limit(1);

    if (byNik) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 });
    }

    const [created] = await db
      .insert(userIdentity)
      .values({ userId: session.user.id, nikEncrypted, nikHash, nikFirst4: first4, nikLast4: last4, verificationStatus: "PENDING" })
      .returning();

    return NextResponse.json({
      data: {
        verificationStatus: created.verificationStatus,
        maskedNik: maskNikFromParts(first4, last4),
      },
    });
  } catch (e: unknown) {
    const cause = String((e as Record<string, unknown>)?.cause ?? "");
    if ((e as { code?: string })?.code === "23505" || cause.includes("unique constraint")) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 });
    }
    console.error("[POST /api/identity/nik]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  const db = getDb();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db
    .select({ id: userIdentity.id, verificationStatus: userIdentity.verificationStatus })
    .from(userIdentity)
    .where(eq(userIdentity.userId, session.user.id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Data identitas tidak ditemukan" }, { status: 404 });
  }

  if (existing.verificationStatus === "VERIFIED") {
    return NextResponse.json({ error: "Identitas yang sudah terverifikasi tidak dapat dihapus" }, { status: 403 });
  }

  await db.delete(userIdentity).where(eq(userIdentity.userId, session.user.id));

  return NextResponse.json({ success: true });
}
