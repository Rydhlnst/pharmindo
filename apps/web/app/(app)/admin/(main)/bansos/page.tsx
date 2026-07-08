'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Megaphone,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  MagnifyingGlass as Search,
  ClipboardText as ClipboardList,
  Clock,
  ChartBar,
  Users,
  CalendarBlank,
} from '@phosphor-icons/react';


import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminAsyncState from '@/components/admin/AdminAsyncState';
import { platformFetch, getPlatformErrorMessage } from '@/lib/api/platform';
import { useActionToast } from '@/lib/use-action-toast';
import { DUMMY_PROGRAMS, DUMMY_APPLICATIONS, BansosProgram, BansosApplication } from '@/lib/dummy-bansos';
import { formatBansosPeriod } from '@/lib/bansos';

export default function AdminBansosPage() {
  const { runWithToast } = useActionToast();
  const [programs, setPrograms] = useState<BansosProgram[]>([]);
  const [applications, setApplications] = useState<BansosApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<BansosApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastingApp, setBroadcastingApp] = useState<BansosApplication | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use dummy data since backend DB logic is not fully wired
      await new Promise(res => setTimeout(res, 600)); // fake delay
      setPrograms(DUMMY_PROGRAMS);
      setApplications(DUMMY_APPLICATIONS);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data bansos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await runWithToast(
        () => platformFetch(`/admin/bansos/applications/${id}/approve`, { method: 'POST' }),
        { loading: 'Menyetujui...', success: 'Pengajuan disetujui', error: 'Gagal menyetujui' }
      );
      await loadData();
      const app = applications.find(a => a.id === id);
      if (app) {
        setBroadcastingApp(app);
        setShowBroadcast(true);
      }
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    try {
      await runWithToast(
        () => platformFetch(`/admin/bansos/applications/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: rejectReason })
        }),
        { loading: 'Menolak...', success: 'Pengajuan ditolak', error: 'Gagal menolak' }
      );
      await loadData();
      setSelectedApp(null);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'PENDING').length;
  const approvedApps = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedApps = applications.filter(a => a.status === 'REJECTED').length;

  if (loading && !programs.length) {
    return <AdminAsyncState mode="loading" page="Bansos" action="memuat data" />;
  }

  if (error) {
    return <AdminAsyncState mode="error" page="Bansos" action="memuat data" description={error} onRetry={loadData} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08]" />
        <div className="pointer-events-none absolute right-16 top-6 h-24 w-24 rounded-full bg-white/[0.12]" />
        
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Bantuan Sosial</h1>
            <p className="mt-1 text-sm text-white/80">Kelola program dan pengajuan bantuan sosial warga.</p>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/70">Menunggu Review</p>
              <p className="mt-1 text-2xl font-bold">{pendingApps}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/70">Disetujui Bulan Ini</p>
              <p className="mt-1 text-2xl font-bold">{approvedApps}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/70">Ditolak Bulan Ini</p>
              <p className="mt-1 text-2xl font-bold">{rejectedApps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Program Bansos Aktif</h2>
            <Link href="/admin/bansos/tambah">
              <Button className="rounded-xl bg-primary shadow-sm hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Program Baru
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200">
            {programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <CalendarBlank className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak ada program aktif</h3>
                <p className="text-sm">Belum ada program bansos yang dibuat</p>
              </div>
            ) : (
              programs.map((prog) => (
                <div key={prog.id} className="p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{prog.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><CalendarBlank className="w-4 h-4"/> {new Date(prog.startDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric'})} - {new Date(prog.endDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4"/> RT: {prog.allowedRtScope.join(', ')}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">Aktif</Badge>
                  </div>
                  
                  <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700">Kuota Terpakai (Simulasi)</span>
                      <span className="font-bold text-slate-800">45 / 50 KK</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">Pengajuan Masuk</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama atau tiket..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 rounded-xl border-slate-200 pl-9 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Tiket</TableHead>
                <TableHead className="font-semibold text-slate-700">Pemohon</TableHead>
                <TableHead className="font-semibold text-slate-700">No.KK Unik</TableHead>
                <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.filter(a => a.payload.applicantName?.toLowerCase().includes(search.toLowerCase())).map(app => (
                <TableRow key={app.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs font-semibold text-slate-600">
                    #BNS-{app.id.substring(0,6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-800">{app.payload.applicantName}</p>
                    <p className="text-xs text-slate-500">Tier {app.payload.tier || 3}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-amber-50 text-amber-700 border-amber-200">
                      {app.payload.noKkUnik || 'RT01-KK-001'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </TableCell>
                  <TableCell>
                    {app.status === 'PENDING' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Menunggu</Badge>}
                    {app.status === 'APPROVED' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Disetujui</Badge>}
                    {app.status === 'REJECTED' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Ditolak</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="rounded-lg hover:bg-blue-50 hover:text-blue-600">
                      <Eye className="w-4 h-4 mr-1" /> Tinjau
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    Belum ada pengajuan masuk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={o => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Detail Pengajuan</h2>
              <p className="text-sm text-slate-500 mt-1">Tiket #BNS-{selectedApp?.id.substring(0,6).toUpperCase()}</p>
            </div>
            {selectedApp?.status === 'PENDING' && <Badge className="bg-amber-100 text-amber-700 border-none">Perlu Ditinjau</Badge>}
          </div>
          
          {selectedApp && (
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pemohon</p>
                  <p className="font-semibold text-slate-800 mt-1">{selectedApp.payload.applicantName}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No KK Unik</p>
                  <p className="font-mono font-semibold text-amber-700 mt-1">{selectedApp.payload.noKkUnik || 'RT01-KK-001'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Persyaratan Sistem</h3>
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-500" /> Warga aktif terdaftar
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-500" /> Tier 3 (NIK Terverifikasi)
                  </div>
                  {programs.find(p => p.id === selectedApp.payload.programId)?.generalRequirements.includes('BALITA') && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-blue-500" /> Memiliki anggota balita dalam KK
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Pernyataan Pemohon</h3>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-sm text-blue-900 italic">
                  "{selectedApp.payload.notes || 'Saya membutuhkan bantuan ini untuk keperluan sehari-hari.'}"
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Dokumen Terlampir</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(selectedApp.payload.attachments || []).map((att, idx) => (
                    <a key={idx} href={att.url} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center mr-3">
                        <ClipboardList className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="truncate flex-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">{att.category || 'Dokumen'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{att.fileName || 'file.jpg'}</p>
                      </div>
                    </a>
                  ))}
                  {(!selectedApp.payload.attachments || selectedApp.payload.attachments.length === 0) && (
                    <div className="col-span-2 p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      Tidak ada dokumen terlampir
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.status === 'PENDING' && (
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Keputusan Admin</h3>
                  <div className="flex flex-col gap-4">
                    <Textarea 
                      placeholder="Catatan penolakan (opsional jika disetujui)..." 
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="rounded-xl border-slate-200"
                    />
                    <div className="flex gap-3">
                      <Button onClick={() => handleReject(selectedApp.id)} variant="outline" className="flex-1 rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-2" /> Tolak Pengajuan
                      </Button>
                      <Button 
                        onClick={() => handleApprove(selectedApp.id)}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                        disabled={approvedApps >= (programs.find(p => p.id === selectedApp.payload.programId)?.generalRequirements.includes('LANSIA') ? 50 : 100)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> 
                        {approvedApps >= (programs.find(p => p.id === selectedApp.payload.programId)?.generalRequirements.includes('LANSIA') ? 50 : 100) ? 'Kuota Habis' : 'Setujui Pengajuan'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="max-w-md rounded-3xl p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">Pengajuan Disetujui!</DialogTitle>
          <DialogDescription className="text-slate-500 mt-2">
            Pilih cara untuk memberitahukan warga terkait persetujuan bansos ini.
          </DialogDescription>
          
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`📢 Halo, Pengajuan Bantuan Sosial Anda (Tiket #BNS-${broadcastingApp?.id.substring(0,6).toUpperCase()}) telah DISETUJUI oleh Admin RW 025.\n\nSilakan cek detail pencairan di aplikasi Pharmindo25.`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setShowBroadcast(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#128C7E] transition"
            >
              <Megaphone className="w-5 h-5" />
              Notifikasi Pribadi ke WA Pemohon
            </a>
            
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`📢 INFORMASI PROGRAM BANSOS\n\nBansos untuk RT terkait telah selesai diproses. Warga penerima yang telah disetujui dapat mengecek aplikasi untuk info lebih lanjut.`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setShowBroadcast(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 transition"
            >
              <Users className="w-5 h-5" />
              Broadcast Pengumuman Grup RT
            </a>

            <Button variant="ghost" onClick={() => setShowBroadcast(false)} className="rounded-xl text-slate-500 hover:bg-slate-100">
              Lewati
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
