import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createCitizenSchema } from "@abdimas/contracts";

import { getDb } from "@/lib/db";
import { user, userIdentity } from "@/lib/db/schema";
import auth from "@/lib/auth";
import { env } from "@/lib/env";
import { bumpSyncKeysViaBackend } from "@/lib/api/internal-bump";
import { encryptNik, hashNik, nikParts, normalizeNik, maskNikFromParts } from "@/lib/security/nik";

const identityFieldsSchema = createCitizenSchema.pick({
  nik: true,
  name: true,
  gender: true,
  birthPlace: true,
  birthDate: true,
  religion: true,
  maritalStatus: true,
  occupation: true,
  education: true,
  bloodType: true,
  address: true,
  rt: true,
  rw: true,
  status: true,
});

const bodySchema = identityFieldsSchema
  .extend({
    kkNumber: z.string().trim().regex(/^\d{16}$/, "Nomor KK harus 16 digit angka").optional(),
    familyRelationship: z.string().trim().min(2).max(60).optional(),
  })
  .refine((data) => !(data.kkNumber && !data.familyRelationship), {
    path: ["familyRelationship"],
    message: "Hubungan keluarga wajib diisi jika nomor KK diisi",
  })
  .refine((data) => !(!data.kkNumber && data.familyRelationship), {
    path: ["kkNumber"],
    message: "Nomor KK wajib diisi jika hubungan keluarga dipilih",
  });

function isSuspiciousNikPattern(nik: string) {
  const repeatedDigits = /^(\d)\1{15}$/.test(nik);
  const sequentialAscending = nik === "1234567890123456";
  const sequentialDescending = nik === "6543210987654321";

  return repeatedDigits || sequentialAscending || sequentialDescending;
}

function isValidNikDatePart(nik: string) {
  const dayRaw = Number(nik.slice(6, 8));
  const month = Number(nik.slice(8, 10));
  const day = dayRaw > 40 ? dayRaw - 40 : dayRaw;

  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;

  return true;
}

function getUniqueViolationTarget(error: unknown) {
  const message =
    (error as { constraint?: string; cause?: { constraint?: string }; message?: string })?.constraint ||
    (error as { constraint?: string; cause?: { constraint?: string }; message?: string })?.cause?.constraint ||
    (error as { message?: string })?.message ||
    "";

  return message.toLowerCase();
}

export async function POST(req: Request) {
  const db = getDb();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    name,
    gender,
    birthPlace,
    birthDate,
    religion,
    maritalStatus,
    occupation,
    education,
    bloodType,
    address,
    rt,
    rw,
    status,
    kkNumber,
    familyRelationship,
  } = parsed.data;

  let nik: string;
  try {
    nik = normalizeNik(parsed.data.nik);
  } catch {
    return NextResponse.json({ error: "NIK harus 16 digit" }, { status: 400 });
  }

  if (isSuspiciousNikPattern(nik) || !isValidNikDatePart(nik)) {
    return NextResponse.json({ error: "Format NIK tidak valid" }, { status: 400 });
  }

  try {
    const nikHash = hashNik(nik, env.NIK_HASH_PEPPER());
    const nikEncrypted = encryptNik(nik, env.NIK_ENCRYPTION_KEY_BASE64());
    const { first4, last4 } = nikParts(nik);

    const [existingIdentityByUserId, existingIdentityByNik] = await Promise.all([
      db
        .select({ id: userIdentity.id, verificationStatus: userIdentity.verificationStatus })
        .from(userIdentity)
        .where(eq(userIdentity.userId, session.user.id))
        .limit(1),
      db
        .select({ id: userIdentity.id })
        .from(userIdentity)
        .where(eq(userIdentity.nikHash, nikHash))
        .limit(1),
    ]);

    const existingOwn = existingIdentityByUserId[0];

    if (existingOwn) {
      if (existingOwn.verificationStatus !== "REJECTED") {
        return NextResponse.json({ error: "Identitas akun ini sudah terdaftar" }, { status: 409 });
      }
      // REJECTED — allow full resubmission by updating existing record
      if (existingIdentityByNik.length > 0 && existingIdentityByNik[0].id !== existingOwn.id) {
        return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 });
      }
      const [updated] = await db
        .update(userIdentity)
        .set({
          nikEncrypted,
          nikHash,
          nikFirst4: first4,
          nikLast4: last4,
          fullName: name.trim(),
          gender,
          birthPlace,
          birthDate,
          religion,
          maritalStatus,
          occupation,
          education,
          bloodType: bloodType ?? null,
          address,
          rt,
          rw,
          citizenStatus: status,
          kkNumber: kkNumber?.trim() || null,
          familyRelationship: familyRelationship?.trim() || null,
          verificationStatus: "PENDING",
          rejectionReason: null,
        })
        .where(eq(userIdentity.userId, session.user.id))
        .returning();
      await bumpSyncKeysViaBackend([
        "admin:verification",
        "admin:dashboard",
        `user:${session.user.id}:identity`,
      ]);
      return NextResponse.json({
        data: {
          verificationStatus: updated.verificationStatus,
          maskedNik: maskNikFromParts(first4, last4),
        },
      });
    }

    if (existingIdentityByNik.length > 0) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 });
    }

    const [created] = await db
      .insert(userIdentity)
      .values({
        userId: session.user.id,
        nikEncrypted,
        nikHash,
        nikFirst4: first4,
        nikLast4: last4,
        fullName: name.trim(),
        gender,
        birthPlace,
        birthDate,
        religion,
        maritalStatus,
        occupation,
        education,
        bloodType: bloodType ?? null,
        address,
        rt,
        rw,
        citizenStatus: status,
        kkNumber: kkNumber?.trim() || null,
        familyRelationship: familyRelationship?.trim() || null,
        verificationStatus: "PENDING",
      })
      .returning();

    const adminEmails = new Set(env.ADMIN_EMAILS().map((e) => e.toLowerCase()));
    if (adminEmails.has(session.user.email.toLowerCase())) {
      await db.update(user).set({ role: "ADMIN" }).where(eq(user.id, session.user.id));
    }

    await bumpSyncKeysViaBackend([
      "admin:verification",
      "admin:dashboard",
      `user:${session.user.id}:identity`,
    ]);

    return NextResponse.json({
      data: {
        verificationStatus: created.verificationStatus,
        maskedNik: maskNikFromParts(first4, last4),
      },
    });
  } catch (e: unknown) {
    const target = getUniqueViolationTarget(e);

    if ((e as { code?: string })?.code === "23505") {
      if (target.includes("user_identity_user_id_uq")) {
        return NextResponse.json({ error: "Identitas akun ini sudah terdaftar" }, { status: 409 });
      }
      if (target.includes("user_identity_nik_hash_uq")) {
        return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 });
      }
      return NextResponse.json({ error: "Data sudah terdaftar" }, { status: 409 });
    }
    const message = typeof (e as { message?: string })?.message === "string" ? (e as { message?: string }).message! : "";
    if (message.includes("NIK_ENCRYPTION_KEY_BASE64")) {
      return NextResponse.json(
        { error: "Server misconfigured: NIK encryption key invalid" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
