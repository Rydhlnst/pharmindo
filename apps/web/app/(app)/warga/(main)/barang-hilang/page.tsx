'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import EmptyState from '@/components/warga/barang-hilang/EmptyState';
import LaporanList from '@/components/warga/barang-hilang/LaporanList';
import { platformFetch } from '@/lib/api/platform';
import { mapBackendBarangHilang, type BackendBarangHilang } from '@/lib/barang-hilang-mapper';
import type { LaporanBarangHilang } from '@/types/barang-hilang';

export default function BarangHilangWargaPage() {
  const [data, setData] = useState<LaporanBarangHilang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await platformFetch<BackendBarangHilang[]>('/barang-hilang?limit=50');
        if (!active) return;
        setData((res.data ?? []).map(mapBackendBarangHilang));
      } catch (err) {
        console.error(err);
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

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

        {loading ? (
          <div className="text-center text-sm text-slate-500 py-8">Memuat laporan...</div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <LaporanList data={data} />
        )}
      </div>
    </main>
  );
}
