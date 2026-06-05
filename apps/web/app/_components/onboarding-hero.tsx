import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OnboardingHero() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10 text-slate-950">
      <section className="w-full max-w-md">
        <div className="rounded-[32px] border border-slate-200 bg-transparent px-7 pb-7 pt-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          {/* Logo Pharmindo25 — menggantikan ikon gedung */}
          <div className="mb-8 flex h-18 w-18 items-center justify-center overflow-hidden ">
            <Image
              src="/pharmindo25.png"
              alt="Logo Pharmindo25"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <h1 className="max-w-xs text-[2.35rem] font-bold leading-[1.02] tracking-[-0.055em] text-slate-950">
            Manajemen
            <br />
            Kependudukan
            <br/>
            RW 25 Pharmindo
          </h1>
          <p className="mt-5 max-w-sm text-[16.5px] leading-6 text-slate-500 text-justify">
            Layanan Informasi Manajemen Data Kependudukan dan catatan sipil di Lingkungan Rukun Warga (RW) 25 Pharmindo Kelurahan Melong Kecamatan Cimahi Selatan Kota Cimahi
          </p>

          {/* Ilustrasi Bangunan Pharmindo — menggantikan ilustrasi abstrak */}
          <div className="relative mt-9 h-56 overflow-hidden rounded-[28px]">
            {/* Gradient overlay bawah agar gambar menyatu halus */}
            {/* Gambar bangunan Pharmindo */}
            <Image
              src="/pharmindo-building.png"
              alt="Bangunan wilayah Pharmindo RW 25 Cimahi"
              fill
              className="object-cover object-bottom px-2 pb-2"
              priority
            />
          </div>

          <div className="mt-0 space-y-3">
            <Button
              asChild
              className="h-auto w-full rounded-[22px] bg-[color:var(--primary)] px-5 py-4 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] hover:bg-[color:var(--brand-700)]"
            >
              <Link href="/sign-in">
                Masuk
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-auto w-full rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-sm font-semibold tracking-[-0.01em] text-[color:var(--primary)] shadow-none hover:bg-slate-50"
            >
              <Link href="/register">Daftar Akun Warga</Link>
            </Button>
          </div>

          <p className="mt-5 text-center text-[13px] leading-6 text-slate-400">
            Warga terdaftar dapat langsung masuk. Akun baru tetap melalui verifikasi identitas.
          </p>
        </div>
      </section>
    </main>
  );
}
