import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BarangHilangForm from '@/components/warga/barang-hilang/form/BarangHilangForm';

export default function LaporanBaruPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-6 px-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/warga/barang-hilang" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Buat Laporan</h1>
            <p className="text-sm text-slate-500 mt-0.5">Laporkan barang Anda yang hilang</p>
          </div>
        </div>

        <BarangHilangForm />
      </div>
    </main>
  );
}
