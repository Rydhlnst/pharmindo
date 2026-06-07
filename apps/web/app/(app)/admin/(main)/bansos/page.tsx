'use client';

import { Wrench } from '@phosphor-icons/react';

export default function AdminBansosPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-slate-100 p-6">
        <Wrench className="h-16 w-16 text-slate-500" weight="duotone" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Under Maintenance</h1>
        <p className="mt-2 text-slate-500 max-w-md mx-auto">
          Fitur Bantuan Sosial (Bansos) saat ini sedang dalam tahap pemeliharaan dan pengembangan lebih lanjut. Silakan periksa kembali nanti.
        </p>
      </div>
    </div>
  );
}
