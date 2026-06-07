import Link from 'next/link';
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EmptyState() {
  return (
    <Card className="border-dashed border-2 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <PackageOpen className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-800">
          Belum Ada Laporan
        </h3>
        <p className="mb-6 max-w-[250px] text-sm text-slate-500 leading-relaxed">
          Anda belum pernah membuat laporan kehilangan. Jika Anda kehilangan barang, segera laporkan di sini.
        </p>
        <Button asChild className="rounded-full shadow-sm hover:shadow-md transition-all h-12 px-6">
          <Link href="/warga/barang-hilang/baru">
            <Plus className="mr-2 h-4 w-4" />
            Buat Laporan Baru
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
