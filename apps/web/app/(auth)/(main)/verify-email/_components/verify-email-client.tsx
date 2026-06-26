"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const OTP_LENGTH = 6;

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

function getErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Silakan coba lagi.";
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otp = digits.join("");

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) next[i] = pasted[i] ?? "";
      return next;
    });
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      toast({
        title: "Kode belum lengkap",
        description: `Masukkan ${OTP_LENGTH} digit kode verifikasi.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.emailOtp.verifyEmail({ email, otp });
      const err = readBetterAuthError(res);
      if (err) throw new Error(err);

      toast({
        title: "Email terverifikasi",
        description: "Selamat datang di portal warga.",
        variant: "success",
      });

      window.location.assign("/warga");
    } catch (error: unknown) {
      toast({
        title: "Kode tidak valid",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      const err = readBetterAuthError(res);
      if (err) throw new Error(err);

      toast({ title: "Kode dikirim ulang", description: "Cek email kamu.", variant: "success" });
    } catch (error: unknown) {
      toast({
        title: "Gagal mengirim ulang",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-[-0.01em] text-slate-500">RW 25 Cimahi</div>
          <Button
            type="button"
            onClick={() => router.push("/sign-in")}
            size="icon"
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Kembali"
            disabled={loading}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <section className="pb-8 pt-10">
          <h1 className="max-w-xs text-[2.45rem] font-bold leading-[1.02] tracking-[-0.055em] text-slate-950">
            Verifikasi Email
          </h1>
          <p className="mt-4 max-w-sm text-[16px] leading-8 text-slate-500">
            Kami mengirim kode 6 digit ke <span className="font-semibold text-slate-700">{email || "email kamu"}</span>.
          </p>
        </section>

        <section className="mt-auto rounded-[32px] border border-slate-200 bg-white px-6 pb-8 pt-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  value={digit}
                  onChange={(e) => setDigit(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  maxLength={1}
                  disabled={loading}
                  className="h-14 w-12 rounded-[16px] border border-slate-200 bg-white text-center text-xl font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-auto w-full rounded-[22px] bg-[color:var(--primary)] py-4 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] hover:bg-[color:var(--brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </Button>

            <div className="flex items-center justify-center gap-1 text-xs">
              <span className="text-slate-500">Tidak menerima kode?</span>
              <Button
                type="button"
                onClick={handleResend}
                variant="link"
                size="sm"
                className="h-auto px-0 py-0 text-xs font-semibold text-[color:var(--primary)] hover:text-[color:var(--brand-700)]"
                disabled={resending || loading}
              >
                {resending ? "Mengirim..." : "Kirim ulang"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
