'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LaporanBarangHilang } from '@/types/barang-hilang';
import LaporanCard from './LaporanCard';

interface LaporanListProps {
  data: LaporanBarangHilang[];
}

const ITEMS_PER_PAGE = 5;

export default function LaporanList({ data }: LaporanListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Laporan Saya ({data.length})
        </h2>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/warga/barang-hilang/baru">
            <Plus className="mr-1 h-4 w-4" />
            Buat Baru
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {paginatedData.map((item) => (
          <LaporanCard key={item.id} data={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full w-9 h-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-slate-600">
            Hal {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full w-9 h-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
