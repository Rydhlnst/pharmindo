"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { GoogleIcon } from "@/components/ui/google-icon";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username maksimal 30 karakter")
  .regex(/^[a-zA-Z0-9]+$/, "Username hanya boleh huruf dan angka")
  .transform((value) => value.toLowerCase());

const phoneSchema = z
  .string()
  .trim()
  .regex(/^08[0-9]{8,11}$/, "Nomor HP tidak valid (contoh: 081234567890)");

const emailSchema = z
  .string()
  .trim()
  .email("Email tidak valid")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(200, "Password terlalu panjang")
  .refine((value) => /[A-Za-z]/.test(value), { message: "Password harus mengandung huruf" })
  .refine((value) => /\d/.test(value), { message: "Password harus mengandung angka" });

const schema = z
  .object({
    username: usernameSchema,
    phoneNumber: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .refine(
    (data) =>
      !data.password.toLowerCase().includes(data.username) &&
      !data.password.toLowerCase().includes(data.email.split("@")[0] ?? ""),
    { path: ["password"], message: "Password tidak boleh mengandung username atau email" },
  );

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function getErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Silakan coba lagi.";
}

function readBetterAuthError(value: unknown) {
  if (!value || typeof value !== "object" || !("error" in value)) return null;
  const err = (value as { error?: unknown }).error;
  if (!err) return null;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Terjadi kesalahan";
}

export default function RegisterClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>({
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function setValue<K extends keyof FormValues>(field: K, value: FormValues[K]) {
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

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field as keyof FormValues]) {
          fieldErrors[field as keyof FormValues] = issue.message;
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
      const signUpRes = await authClient.signUp.email({
        name: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
        username: parsed.data.username,
        displayUsername: parsed.data.username,
        phoneNumber: parsed.data.phoneNumber,
      });

      const signUpErr = readBetterAuthError(signUpRes);
      if (signUpErr) throw new Error(signUpErr);

      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: parsed.data.email,
        type: "email-verification",
      });
      const otpErr = readBetterAuthError(otpRes);
      if (otpErr) throw new Error(otpErr);

      toast({
        title: "Akun dibuat",
        description: "Cek email kamu untuk kode verifikasi.",
        variant: "success",
      });

      router.push(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
    } catch (error: unknown) {
      toast({
        title: "Gagal daftar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/warga" });
    } catch (error: unknown) {
      toast({
        title: "Gagal masuk dengan Google",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-[-0.01em] text-slate-500">RW 25 Cimahi</div>
          <Button
            type="button"
            onClick={() => router.push("/")}
            size="icon"
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Kembali"
            disabled={loading || googleLoading}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <section className="pb-8 pt-10">
          <h1 className="max-w-xs text-[2.45rem] font-bold leading-[1.02] tracking-[-0.055em] text-slate-950">
            Buat Akun
          </h1>
          <p className="mt-4 max-w-sm text-[16px] leading-8 text-slate-500">
            Daftar dulu untuk masuk ke portal warga. Lengkapi data diri nanti di Pengaturan.
          </p>
        </section>

        <section className="mt-auto rounded-[32px] border border-slate-200 bg-white px-6 pb-8 pt-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" error={errors.username} hint="Minimal 3 karakter, huruf dan angka saja.">
              <Input
                value={values.username}
                onChange={(e) =>
                  setValue("username", e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 30))
                }
                placeholder="contoh: warga025"
                className={inputClassName}
                autoComplete="username"
                disabled={loading || googleLoading}
              />
            </Field>

            <Field label="Nomor HP" error={errors.phoneNumber}>
              <Input
                inputMode="numeric"
                value={values.phoneNumber}
                onChange={(e) => setValue("phoneNumber", e.target.value.replace(/[^\d]/g, "").slice(0, 13))}
                placeholder="081234567890"
                className={inputClassName}
                autoComplete="tel"
                disabled={loading || googleLoading}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value.trim().toLowerCase())}
                placeholder="warga@mail.com"
                className={inputClassName}
                autoComplete="email"
                disabled={loading || googleLoading}
              />
            </Field>

            <Field
              label="Password"
              error={errors.password}
              hint="Minimal 8 karakter dengan kombinasi huruf dan angka."
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(e) => setValue("password", e.target.value)}
                  placeholder="Buat password"
                  className={`${inputClassName} pr-12`}
                  autoComplete="new-password"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="h-auto w-full rounded-[22px] bg-[color:var(--primary)] py-4 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] hover:bg-[color:var(--brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Daftar"}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">atau</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              variant="outline"
              className="h-auto w-full rounded-[22px] border-slate-200 bg-white py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              {googleLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
            </Button>

            <p className="pt-2 text-center text-[11px] leading-relaxed text-slate-400">
              Dengan mendaftar, Anda menyetujui ketentuan layanan dan kebijakan privasi internal.
            </p>

            <div className="flex items-center justify-center gap-1 text-xs">
              <span className="text-slate-500">Sudah punya akun?</span>
              <Button
                type="button"
                onClick={() => router.push("/sign-in")}
                variant="link"
                size="sm"
                className="h-auto px-0 py-0 text-xs font-semibold text-[color:var(--primary)] hover:text-[color:var(--brand-700)]"
                disabled={loading || googleLoading}
              >
                Masuk
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
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
    <div>
      <Label className="mb-2 block text-xs font-semibold text-slate-800">{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "h-auto rounded-[20px] border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[color:var(--ring)]";
