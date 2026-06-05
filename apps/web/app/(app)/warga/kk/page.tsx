'use client';

import Link from 'next/link';
import { ChevronLeft, FilePlus2, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PilihanTambahKKPage() {
  return (
    <div className="safe-top flex w-full flex-col gap-6 p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/warga"
          className="flex items-center gap-1 md:gap-2 text-sm md:text-base font-semibold text-blue-600 transition hover:opacity-80 bg-transparent border-none outline-none"
        >
          <ChevronLeft className="h-5 w-5" />
          Kembali
        </Link>
      </div>

      {/* Title Card */}
      <div className="relative overflow-hidden rounded-[12px] bg-[#EFF6FF] p-4 md:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/[0.05]" />
        <div className="pointer-events-none absolute right-12 top-2 h-24 w-24 rounded-full bg-blue-500/[0.08]" />

        <div className="relative z-10 flex items-start md:items-center gap-3">
          <div className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <FileText className="size-5 md:size-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">Layanan Kartu Keluarga</h1>
            <p className="mt-1 text-xs md:text-sm text-blue-600/80">
              Pilih layanan pengajuan KK yang ingin Anda lakukan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Link href="/warga/kk/tambah" className="group rounded-[16px] bg-white p-4 md:p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-100 flex flex-col gap-3 md:gap-4">
          <div className="flex size-12 md:size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <FilePlus2 className="size-6 md:size-7" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Tambah KK Baru</h2>
            <p className="mt-1 text-xs md:text-sm text-gray-500">Pengajuan pembuatan Kartu Keluarga (KK) baru untuk keluarga Anda.</p>
          </div>
        </Link>
        <Link href="/warga/kk/tambah-anggota" className="group rounded-[16px] bg-white p-4 md:p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-sky-100 flex flex-col gap-3 md:gap-4">
          <div className="flex size-12 md:size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform group-hover:scale-110">
            <UserPlus className="size-6 md:size-7" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors">Tambah Anggota Keluarga</h2>
            <p className="mt-1 text-xs md:text-sm text-gray-500">Pendaftaran anggota keluarga baru (anak, istri, dll) ke dalam KK yang sudah ada.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
