"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldCheck, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { createCitizenSchema } from "@abdimas/contracts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIdentity } from "@/app/(app)/warga/_components/identity-context";
import { RT_OPTIONS } from "@/lib/rt-options";

const onboardingSchema = createCitizenSchema.pick({
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

const schema = onboardingSchema
  .and(
    z.object({
      kkNumber: z.string().trim().regex(/^\d{16}$/, "Nomor KK harus berisi 16 digit angka").optional(),
      familyRelationship: z.string().trim().min(2, "Hubungan keluarga wajib diisi").max(60).optional(),
    }),
  )
  .refine((data) => !isSuspiciousNikPattern(data.nik), {
    path: ["nik"],
    message: "Format NIK tidak valid",
  })
  .refine((data) => isValidNikDatePart(data.nik), {
    path: ["nik"],
    message: "Tanggal lahir pada NIK tidak valid",
  })
  .refine((data) => !(data.kkNumber && !data.familyRelationship), {
    path: ["familyRelationship"],
    message: "Pilih hubungan keluarga jika nomor KK diisi",
  })
  .refine((data) => !(!data.kkNumber && data.familyRelationship), {
    path: ["kkNumber"],
    message: "Isi nomor KK jika hubungan keluarga dipilih",
  });

type FormValues = {
  name: string;
  nik: string;
  gender: "" | "L" | "P";
  birthPlace: string;
  birthDate: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  education: string;
  bloodType?: string;
  address: string;
  rt: string;
  rw: string;
  status: "PENDUDUK_TETAP" | "NGEKOST";
  kkNumber?: string;
  familyRelationship?: string;
};

type FormField = keyof FormValues;

const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const PENDIDIKAN_OPTIONS = [
  "Tidak/Belum Sekolah",
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/Sederajat",
  "D1",
  "D2",
  "D3",
  "D4/S1",
  "S2",
  "S3",
];
const PEKERJAAN_OPTIONS = [
  "Belum/Tidak Bekerja",
  "Pelajar/Mahasiswa",
  "PNS",
  "TNI",
  "Polri",
  "Karyawan Swasta",
  "Wiraswasta",
  "Pedagang",
  "Petani",
  "Nelayan",
  "Guru",
  "Dokter",
  "Buruh",
  "Ibu Rumah Tangga",
  "Pensiunan",
  "Lainnya",
];
const GOLONGAN_DARAH_OPTIONS = ["", "A", "B", "AB", "O", "Tidak Tahu"];
const FAMILY_RELATIONSHIP_OPTIONS = ["Kepala Keluarga", "Istri", "Anak", "Orang Tua", "Saudara", "Lainnya"];

const INITIAL_VALUES: FormValues = {
  name: "",
  nik: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  religion: "",
  maritalStatus: "",
  occupation: "",
  education: "",
  bloodType: undefined,
  address: "",
  rt: "",
  rw: "025",
  status: "PENDUDUK_TETAP",
  kkNumber: undefined,
  familyRelationship: undefined,
};

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

function normalizeValues(values: FormValues) {
  return {
    name: values.name.trim(),
    nik: values.nik,
    gender: values.gender,
    birthPlace: values.birthPlace.trim(),
    birthDate: values.birthDate,
    religion: values.religion,
    maritalStatus: values.maritalStatus,
    occupation: values.occupation,
    education: values.education,
    bloodType: values.bloodType || undefined,
    address: values.address.trim(),
    rt: values.rt,
    rw: values.rw.replace(/\D/g, "").slice(0, 3),
    status: values.status,
    kkNumber: values.kkNumber?.trim() || undefined,
    familyRelationship: values.familyRelationship?.trim() || undefined,
  } satisfies FormValues;
}

function getApiErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const payload = data as { error?: string | { message?: string }; message?: string };
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.error?.message === "string") return payload.error.message;
  if (typeof payload.message === "string") return payload.message;
  return null;
}

export default function IdentityFormClient() {
  const router = useRouter();
  const { toast } = useToast();
  const identity = useIdentity();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function setValue<K extends FormField>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalized = normalizeValues(values);
    const parsed = schema.safeParse(normalized);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FormField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field as FormField]) {
          fieldErrors[field as FormField] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast({
        title: "Input tidak valid",
        description: parsed.error.issues[0]?.message || "Periksa kembali data yang kamu masukkan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/identity/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data) || "Gagal menyimpan data diri");
      }

      await identity.refreshIdentity();

      toast({
        title: "Profil tersimpan",
        description: "Data diri kamu sedang menunggu verifikasi admin RW/RT.",
        variant: "success",
      });

      router.push("/warga/settings");
    } catch (error: unknown) {
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNik() {
    setDeleting(true);
    try {
      const res = await fetch("/api/identity/nik", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus NIK");
      }

      await identity.refreshIdentity();
      toast({
        title: "Profil direset",
        description: "Data NIK berhasil dihapus. Silakan isi ulang jika diperlukan.",
        variant: "success",
      });
      setShowDeleteConfirm(false);
      // Let the UI switch back to form mode since verificationStatus will be NONE
    } catch (error: unknown) {
      toast({
        title: "Gagal menghapus profil",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (identity.verificationStatus !== "NONE") {
    return (
      <div className="safe-top flex w-full flex-col gap-6 p-4 pb-24 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 border-none bg-transparent text-sm font-semibold text-[color:var(--primary)] outline-none transition hover:opacity-80 md:text-base"
          >
            <ChevronLeft className="h-5 w-5" />
            Kembali
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[12px] bg-[color:var(--admin-primary-soft)] p-4 md:p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[color:var(--primary)]/5" />
          <div className="pointer-events-none absolute right-12 top-2 h-24 w-24 rounded-full bg-[color:var(--primary)]/8" />
          <div className="relative z-10 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-[color:var(--primary)] md:text-2xl">Profil Warga</h1>
              <p className="mt-1 text-xs text-[color:var(--primary)]/80 md:text-sm">
                Data NIK Anda sudah tersimpan di sistem.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">Status Identitas</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-foreground">Nama Terdaftar</Label>
              <p className="mt-1 font-medium">{identity.userName}</p>
            </div>
            
            <div>
              <Label className="text-xs font-semibold text-foreground">NIK</Label>
              <p className="mt-1 font-mono">{identity.maskedNik}</p>
            </div>
            
            <div>
              <Label className="text-xs font-semibold text-foreground">Status Verifikasi</Label>
              <div className="mt-2 flex items-center gap-2">
                {identity.verificationStatus === 'VERIFIED' && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">Terverifikasi</span>
                  </div>
                )}
                {identity.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">Menunggu Verifikasi Admin</span>
                  </div>
                )}
                {identity.verificationStatus === 'REJECTED' && (
                  <div className="flex flex-col gap-1 rounded-lg bg-red-50 px-3 py-2 text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">Verifikasi Ditolak</span>
                    </div>
                    {identity.rejectionReason && (
                      <p className="text-xs">{identity.rejectionReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {identity.verificationStatus === 'VERIFIED' && (
              <div>
                <Label className="text-xs font-semibold text-foreground">No. KK Unik</Label>
                <div className="mt-1">
                  <span className="font-mono text-sm font-bold tracking-wider px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200 inline-block">
                    RT00-KK-123
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Digunakan untuk urusan administratif dengan RT/RW</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-red-100 bg-red-50/50 p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-red-800">Perbarui Profil</h2>
          <p className="text-xs text-red-600 mb-4 leading-relaxed">
            Jika ada kesalahan data atau verifikasi ditolak, Anda dapat menghapus data NIK dan mengisi ulang. <br/>
            <strong>Perhatian:</strong> Menghapus NIK akan mengunci kembali fitur Bansos, Pemilu, Mutasi, dan KK.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-xl flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Hapus NIK & Reset Profil
          </Button>
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="rounded-[24px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data NIK?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus NIK Anda dari sistem dan mengembalikan status Anda menjadi <strong>Belum Diverifikasi</strong>. Anda akan kehilangan akses ke fitur premium sampai Anda mengisi NIK baru dan diverifikasi ulang.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleDeleteNik();
                }}
                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus NIK'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="safe-top flex w-full flex-col gap-6 p-4 pb-24 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 border-none bg-transparent text-sm font-semibold text-[color:var(--primary)] outline-none transition hover:opacity-80 md:text-base"
        >
          <ChevronLeft className="h-5 w-5" />
          Kembali
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[12px] bg-[color:var(--admin-primary-soft)] p-4 md:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[color:var(--primary)]/5" />
        <div className="pointer-events-none absolute right-12 top-2 h-24 w-24 rounded-full bg-[color:var(--primary)]/8" />
        <div className="relative z-10 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold text-[color:var(--primary)] md:text-2xl">Lengkapi Data Diri</h1>
            <p className="mt-1 text-xs text-[color:var(--primary)]/80 md:text-sm">
              Data ini dipakai admin RW/RT untuk verifikasi keanggotaan warga. Sebagian fitur baru terbuka setelah disetujui.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormSection title="Identitas">
          <Field label="Nama Lengkap" error={errors.name}>
            <Input
              value={values.name}
              onChange={(e) => setValue("name", e.target.value.slice(0, 120))}
              placeholder="Nama sesuai KTP"
              className={inputClassName}
              autoComplete="name"
              disabled={loading}
            />
          </Field>

          <Field label="NIK" error={errors.nik} hint={`${values.nik.length}/16 digit`}>
            <Input
              inputMode="numeric"
              value={values.nik}
              onChange={(e) => setValue("nik", e.target.value.replace(/\D/g, "").slice(0, 16))}
              placeholder="16 digit NIK"
              className={inputClassName}
              autoComplete="off"
              disabled={loading}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis Kelamin" error={errors.gender}>
              <select
                value={values.gender}
                onChange={(e) => setValue("gender", e.target.value as FormValues["gender"])}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>

            <Field label="Gol. Darah" error={errors.bloodType}>
              <select
                value={values.bloodType ?? ""}
                onChange={(e) => setValue("bloodType", e.target.value || undefined)}
                disabled={loading}
                className={selectClassName}
              >
                {GOLONGAN_DARAH_OPTIONS.map((option) => (
                  <option key={option || "empty"} value={option}>
                    {option || "Pilih"}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tempat Lahir" error={errors.birthPlace}>
              <Input
                value={values.birthPlace}
                onChange={(e) => setValue("birthPlace", e.target.value.slice(0, 120))}
                placeholder="Contoh: Cimahi"
                className={inputClassName}
                disabled={loading}
              />
            </Field>

            <Field label="Tanggal Lahir" error={errors.birthDate}>
              <Input
                type="date"
                value={values.birthDate}
                onChange={(e) => setValue("birthDate", e.target.value)}
                className={inputClassName}
                disabled={loading}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Agama" error={errors.religion}>
              <select
                value={values.religion}
                onChange={(e) => setValue("religion", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                {AGAMA_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status Perkawinan" error={errors.maritalStatus}>
              <select
                value={values.maritalStatus}
                onChange={(e) => setValue("maritalStatus", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                <option value="BELUM_KAWIN">Belum Kawin</option>
                <option value="KAWIN">Kawin</option>
                <option value="CERAI_HIDUP">Cerai Hidup</option>
                <option value="CERAI_MATI">Cerai Mati</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pendidikan" error={errors.education}>
              <select
                value={values.education}
                onChange={(e) => setValue("education", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                {PENDIDIKAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pekerjaan" error={errors.occupation}>
              <select
                value={values.occupation}
                onChange={(e) => setValue("occupation", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                {PEKERJAAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Domisili">
          <Field label="Alamat Domisili" error={errors.address}>
            <Input
              value={values.address}
              onChange={(e) => setValue("address", e.target.value.slice(0, 255))}
              placeholder="Alamat lengkap"
              className={inputClassName}
              disabled={loading}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="RT" error={errors.rt}>
              <select
                value={values.rt}
                onChange={(e) => setValue("rt", e.target.value)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Pilih</option>
                {RT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="RW" error={errors.rw}>
              <Input
                value={values.rw}
                onChange={(e) => setValue("rw", e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="025"
                className={inputClassName}
                disabled={loading}
              />
            </Field>

            <Field label="Status" error={errors.status}>
              <select
                value={values.status}
                onChange={(e) => setValue("status", e.target.value as FormValues["status"])}
                disabled={loading}
                className={selectClassName}
              >
                <option value="PENDUDUK_TETAP">Tetap</option>
                <option value="NGEKOST">Penduduk Musiman</option>
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Keluarga (opsional)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nomor KK"
              error={errors.kkNumber}
              hint="Opsional. Isi jika ingin langsung terkait ke data KK."
            >
              <Input
                inputMode="numeric"
                value={values.kkNumber ?? ""}
                onChange={(e) => setValue("kkNumber", e.target.value.replace(/\D/g, "").slice(0, 16) || undefined)}
                placeholder="16 digit nomor KK"
                className={inputClassName}
                disabled={loading}
              />
            </Field>

            <Field label="Hubungan Keluarga" error={errors.familyRelationship}>
              <select
                value={values.familyRelationship ?? ""}
                onChange={(e) => setValue("familyRelationship", e.target.value || undefined)}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Opsional</option>
                {FAMILY_RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-[color-mix(in_srgb,var(--primary),transparent_72%)] hover:bg-[color:var(--brand-700)]"
        >
          {loading ? "Menyimpan..." : "Simpan Data Diri"}
        </Button>
      </form>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-card p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "h-12 rounded-2xl border-[color:var(--input)] bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-[color:var(--ring)]";

const selectClassName =
  "h-12 w-full rounded-2xl border border-[color:var(--input)] bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]";
