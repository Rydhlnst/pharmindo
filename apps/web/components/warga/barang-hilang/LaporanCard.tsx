import Link from 'next/link';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { LaporanBarangHilang } from '@/types/barang-hilang';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function getStatusDetails(status: LaporanBarangHilang['status']) {
  switch (status) {
    case 'pending_verification':
      return { label: 'Menunggu Verifikasi', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' };
    case 'in_verification':
      return { label: 'Sedang Diverifikasi', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' };
    case 'processing':
      return { label: 'Sedang Diproses', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' };
    case 'resolved':
      return { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' };
    case 'rejected':
      return { label: 'Ditolak', className: 'bg-rose-100 text-rose-700 hover:bg-rose-100' };
    case 'archived':
      return { label: 'Diarsipkan', className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' };
    default:
      return { label: status, className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' };
  }
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

interface LaporanCardProps {
  data: LaporanBarangHilang;
}

export default function LaporanCard({ data }: LaporanCardProps) {
  const statusDef = getStatusDetails(data.status);
  
  return (
    <Link href={`/warga/barang-hilang/${data.id}`} className="block group">
      <Card className="overflow-hidden border-slate-200 bg-white transition-all hover:shadow-md hover:border-primary/30">
        <CardContent className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider mb-1">
                {data.ticketNumber}
              </p>
              <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                {data.item.name}
              </h3>
            </div>
            <Badge className={`whitespace-nowrap shadow-none rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusDef.className}`}>
              {statusDef.label}
            </Badge>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="mr-2 h-3.5 w-3.5 shrink-0" />
              <span>Hilang pada: {formatDate(data.incident.date)}</span>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <MapPin className="mr-2 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{data.incident.location}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-primary">
            <span>Lihat Detail Laporan</span>
            <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
