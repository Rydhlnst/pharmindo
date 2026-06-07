'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Tag, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { DUMMY_LAPORAN_SAYA, DUMMY_AUDIT_LOG } from '@/lib/dummy-barang-hilang';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { getStatusDetails } from '@/components/warga/barang-hilang/LaporanCard';
import { StatusTracker, PesanAdmin, RiwayatStatus } from '@/components/warga/barang-hilang/detail/DetailComponents';

export default function DetailBarangHilangWarga() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Try to find the exact report or fallback to first for demo if not found
  const report = useMemo(() => DUMMY_LAPORAN_SAYA.find(r => r.id === id) || DUMMY_LAPORAN_SAYA[0], [id]);
  const statusDef = getStatusDetails(report.status);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  if (!report) return notFound();

  const handleConfirmFound = async () => {
    setIsConfirming(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsConfirming(false);
    setShowConfirmModal(false);
    toast({
      title: "Konfirmasi Berhasil",
      description: "Terima kasih, laporan Anda telah ditutup.",
      variant: "success",
    });
    router.push('/warga/barang-hilang');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-6 px-4">
      <div className="mx-auto max-w-lg">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/warga/barang-hilang" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Detail Laporan</h1>
            <p className="text-sm text-slate-500 mt-0.5">{report.ticketNumber}</p>
          </div>
          <div className="ml-auto">
            <Badge className={`shadow-none px-3 py-1 ${statusDef.className}`}>{statusDef.label}</Badge>
          </div>
        </div>

        <StatusTracker status={report.status} />
        <PesanAdmin status={report.status} reply={report.adminReply} />

        {/* DETAIL BARANG */}
        <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
            <h3 className="font-bold text-slate-800 text-sm">Informasi Barang</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Nama Barang</p>
              <p className="text-sm font-semibold text-slate-800">{report.item.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><PackageSearch className="w-3.5 h-3.5" /> Kategori</p>
                <p className="text-sm font-semibold text-slate-800">{report.item.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Warna</p>
                <p className="text-sm font-semibold text-slate-800">{report.item.color || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Deskripsi Spesifik</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{report.item.description}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Kejadian</p>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(report.incident.date).toLocaleDateString('id-ID')} {report.incident.time ? `pukul ${report.incident.time}` : ''}
              </p>
              <p className="text-sm text-slate-600 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                {report.incident.location}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2">Kronologi:</p>
              <p className="text-sm text-slate-700 italic border-l-2 border-primary pl-3">{report.incident.chronicle}</p>
            </div>
          </CardContent>
        </Card>

        {/* FOTO */}
        {report.photos && report.photos.length > 0 && (
          <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
              <h3 className="font-bold text-slate-800 text-sm">Foto Lampiran</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {report.photos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                    <img src={photo.url} alt="Lampiran" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <RiwayatStatus logs={DUMMY_AUDIT_LOG} />

        {/* ACTIONS */}
        <div className="space-y-3 mt-8">
          {report.status === 'processing' && (
            <Button onClick={() => setShowConfirmModal(true)} className="w-full rounded-full shadow-sm" size="lg">
              <CheckCircle2 className="mr-2 w-5 h-5" />
              Barang Sudah Ditemukan
            </Button>
          )}
          
          {report.status === 'rejected' && (
            <Button asChild className="w-full rounded-full shadow-sm" size="lg">
              <Link href="/warga/barang-hilang/baru">
                Ajukan Laporan Baru
              </Link>
            </Button>
          )}
          

        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="w-[90%] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Barang Sudah Ditemukan?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menutup laporan Anda dan status akan berubah menjadi <b>Selesai</b>. Laporan yang sudah ditutup tidak dapat dibuka kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row mt-4">
            <Button variant="outline" className="rounded-full w-full" onClick={() => setShowConfirmModal(false)}>Batal</Button>
            <Button onClick={handleConfirmFound} disabled={isConfirming} className="rounded-full w-full">
              {isConfirming ? 'Memproses...' : 'Ya, Tutup Laporan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}

// Dummy icon for Palette
const Palette = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);
// Dummy icon for PackageSearch
const PackageSearch = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/></svg>
);
