import { DUMMY_LAPORAN_SAYA } from '@/lib/dummy-barang-hilang';
import EmptyState from '@/components/warga/barang-hilang/EmptyState';
import LaporanList from '@/components/warga/barang-hilang/LaporanList';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BarangHilangWargaPage() {
  const data = DUMMY_LAPORAN_SAYA;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-6 px-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/warga" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Barang Hilang</h1>
            <p className="text-sm text-slate-500 mt-0.5">Pantau laporan kehilangan Anda</p>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <LaporanList data={data} />
        )}
      </div>
    </main>
  );
}
