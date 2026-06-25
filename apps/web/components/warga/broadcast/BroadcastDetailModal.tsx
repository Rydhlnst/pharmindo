'use client';

import { Megaphone, MapPin, Calendar, Clock, Tag, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BroadcastItem } from '@/lib/dummy-broadcast';

interface BroadcastDetailModalProps {
  broadcast: BroadcastItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFoundClick: (broadcast: BroadcastItem) => void;
}

export default function BroadcastDetailModal({ broadcast, isOpen, onClose, onFoundClick }: BroadcastDetailModalProps) {
  if (!broadcast) return null;

  const incidentDate = new Date(broadcast.incidentDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92%] max-w-sm rounded-[1.75rem] p-0 overflow-hidden bg-slate-50 border-0 max-h-[85vh] flex flex-col gap-0 [&>button]:text-white/70 hover:[&>button]:text-white [&>button]:right-5 [&>button]:top-5">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-10 pb-8 text-white shrink-0">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08]" />
          <div className="pointer-events-none absolute right-16 top-6 h-24 w-24 rounded-full bg-white/[0.12]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner mb-4 ring-4 ring-white/10">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight mb-1">
              Info Barang Hilang
            </DialogTitle>
            <DialogDescription className="text-blue-100 font-medium text-sm">
              Laporan dari Warga RT {broadcast.reporterRT}
            </DialogDescription>
            <Badge className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0 shadow-none">
              {broadcast.ticketNumber}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900 font-medium leading-relaxed whitespace-pre-wrap">
            {broadcast.broadcastMessage}
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-100/50 border-b border-slate-100 py-3 px-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500" />
                Informasi Barang
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-white">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nama Barang</p>
                <p className="text-sm font-semibold text-slate-800">{broadcast.itemName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kategori</p>
                  <p className="text-sm font-semibold text-slate-800">{broadcast.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Warna</p>
                  <p className="text-sm font-semibold text-slate-800">{broadcast.itemColor}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Deskripsi Spesifik</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {broadcast.itemDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-100/50 border-b border-slate-100 py-3 px-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" />
                Detail Kejadian
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-white">
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tanggal</p>
                <p className="text-sm font-semibold text-slate-800">{incidentDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Waktu</p>
                <p className="text-sm font-semibold text-slate-800">{broadcast.incidentTime} WIB</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Lokasi Perkiraan</p>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{broadcast.location}</p>
              </div>
            </CardContent>
          </Card>

          {broadcast.photos && broadcast.photos.length > 0 && (
            <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-100/50 border-b border-slate-100 py-3 px-4">
                <h3 className="font-bold text-slate-800 text-sm">Foto Barang</h3>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {broadcast.photos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      <img src={photo.url} alt="Foto Barang" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200 shrink-0 space-y-3">
          <Button 
            className="w-full rounded-full shadow-sm bg-green-600 hover:bg-green-700 text-white" 
            size="lg"
            onClick={() => onFoundClick(broadcast)}
          >
            Saya Menemukan Barang Ini
          </Button>
          <Button 
            variant="outline" 
            className="w-full rounded-full border-slate-300 text-slate-700" 
            size="lg"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
