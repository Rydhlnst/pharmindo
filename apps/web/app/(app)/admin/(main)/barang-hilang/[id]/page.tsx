'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  Megaphone,
  User,
  MapPin,
  CalendarBlank,
  WarningCircle,
  XCircle,
  Info
} from '@phosphor-icons/react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useActionToast } from '@/lib/use-action-toast';

import { platformFetch } from '@/lib/api/platform';
import { mapBackendBarangHilang, type BackendBarangHilang } from '@/lib/barang-hilang-mapper';
import type { LaporanBarangHilang, ReportStatus, ReportPriority } from '@/types/barang-hilang';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; badge: string }> = {
  pending_verification: { label: 'Menunggu Verifikasi', color: '#888780', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  in_verification: { label: 'Sedang Diverifikasi', color: '#378ADD', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Sedang Diproses', color: '#BA7517', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved: { label: 'Selesai', color: '#1D9E75', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Ditolak', color: '#E24B4A', badge: 'bg-red-100 text-red-700 border-red-200' },
  archived: { label: 'Diarsipkan', color: '#5F5E5A', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const PRIORITY_CONFIG: Record<ReportPriority, { label: string; badge: string }> = {
  low: { label: 'Rendah', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  medium: { label: 'Sedang', badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  high: { label: 'Tinggi', badge: 'bg-red-50 text-red-600 border-red-200' },
};

export default function LaporanDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { runWithToast, toast } = useActionToast();
  
  // Unify standard React hooks
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [data, setData] = useState<LaporanBarangHilang | null>(null);
  const [loading, setLoading] = useState(true);

  const [localStatus, setLocalStatus] = useState<ReportStatus>('pending_verification');
  const [localPriority, setLocalPriority] = useState<ReportPriority>('medium');
  const [localAdminNotes, setLocalAdminNotes] = useState('');
  const [localAdminReply, setLocalAdminReply] = useState('');
  const [checklist, setChecklist] = useState({
    identityComplete: false,
    descriptionAdequate: false,
    photoAttached: false,
    chronicleClear: false,
    whatsappVerified: false,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await platformFetch<BackendBarangHilang>(`/admin/barang-hilang/${id}`);
        if (!active) return;
        const mapped = mapBackendBarangHilang(res.data);
        setData(mapped);
        setLocalStatus(mapped.status);
        setLocalPriority(mapped.priority);
        setLocalAdminNotes(mapped.adminNotes ?? '');
        setLocalAdminReply(mapped.adminReply ?? '');
        setChecklist(mapped.verificationChecklist);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);
  
  const [targetRTs, setTargetRTs] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>(['inapp']);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">Memuat laporan...</div>;
  }
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <WarningCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Laporan Tidak Ditemukan</h2>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">Kembali</Button>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[localStatus];
  const priorityConf = PRIORITY_CONFIG[localPriority];

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRTSelect = (rt: string) => {
    setTargetRTs(prev => prev.includes(rt) ? prev.filter(x => x !== rt) : [...prev, rt]);
  };
  
  const handleChannelSelect = (channel: string) => {
    setChannels(prev => prev.includes(channel) ? prev.filter(x => x !== channel) : [...prev, channel]);
  };

  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const handleSave = async (isBroadcast: boolean) => {
    if (localStatus === 'rejected' && !localAdminReply.trim()) {
      toast({
        title: 'Gagal',
        description: 'Anda harus mengisi Pesan Balasan ke warga jika menolak laporan.',
        variant: 'destructive'
      });
      return;
    }

    if (isBroadcast && targetRTs.length === 0) {
      toast({
        title: 'Gagal',
        description: 'Anda harus memilih minimal 1 RT target untuk Broadcast.',
        variant: 'destructive'
      });
      return;
    }

    await runWithToast(
      async () => {
        const nextStatus: ReportStatus = isBroadcast ? 'processing' : localStatus;
        const res = await platformFetch<BackendBarangHilang>(`/admin/barang-hilang/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            priority: localPriority,
            adminNotes: localAdminNotes || null,
            adminReply: localAdminReply || null,
            verificationChecklist: checklist,
          }),
        });
        setData(mapBackendBarangHilang(res.data));
        if (isBroadcast) setLocalStatus('processing');
      },
      {
        loading: isBroadcast ? 'Menyimpan & Mengirim Broadcast...' : 'Menyimpan Laporan...',
        success: isBroadcast ? 'Laporan disimpan dan Broadcast berhasil dikirim!' : 'Laporan berhasil disimpan.',
        error: 'Gagal menyimpan.',
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      
      {/* 4.0 Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/barang-hilang')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{data.ticketNumber}</h1>
              <Badge className={`border shadow-none ${statusConf.badge}`}>{statusConf.label}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Dilaporkan: {new Date(data.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {localStatus === 'rejected' ? (
             <Button variant="destructive" onClick={() => handleSave(false)}>Tolak Laporan</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleSave(false)}>Simpan Saja</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSave(true)}>
                <Megaphone className="w-4 h-4 mr-2" />
                Simpan & Broadcast
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Read Only Data & Checklist */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 4.1 Ringkasan Laporan Warga */}
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Detail Informasi (Read-Only)</h2>
            </div>
            <div className="p-5 flex flex-col gap-6">
              
              {/* Identitas Pelapor */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Pelapor</p>
                    <p className="font-medium text-slate-800">{data.reporter.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">RT / RW</p>
                    <p className="font-medium text-slate-800">RT {data.reporter.rt} / RW {data.reporter.rw}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telepon / WhatsApp</p>
                    <p className="font-medium text-blue-600">{data.reporter.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alamat</p>
                    <p className="font-medium text-slate-800 text-sm">{data.reporter.address}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Detail Barang */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Informasi Barang</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Nama Barang</p>
                    <div className="font-medium text-slate-800 flex items-center">
                      {data.item.name} 
                      <Badge variant="secondary" className="ml-2 font-normal">{data.item.category}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Perkiraan Nilai</p>
                    <p className="font-medium text-slate-800">{data.item.estimatedValue ? `Rp ${data.item.estimatedValue.toLocaleString('id-ID')}` : '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Ciri-ciri Utama</p>
                    <p className="font-medium text-slate-800 text-sm leading-relaxed">{data.item.description}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Kejadian */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Kronologi & Kejadian</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tanggal & Waktu</p>
                    <p className="font-medium text-slate-800">{data.incident.date} {data.incident.time ? `• ${data.incident.time}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Lokasi Kejadian</p>
                    <p className="font-medium text-slate-800">{data.incident.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Kronologi</p>
                    <p className="font-medium text-slate-800 text-sm leading-relaxed">{data.incident.chronicle}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {data.photos.length > 0 && (
                <>
                  <div className="border-t border-slate-100"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Foto Terlampir</p>
                    <div className="flex gap-4">
                      {data.photos.map((photo, idx) => (
                        <div key={idx} className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt="Barang Hilang" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
          </Card>

          {/* 4.2 Checklist Verifikasi */}
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 flex flex-col gap-4">
              <h2 className="font-bold text-slate-800">Checklist Verifikasi Admin</h2>
              {!isChecklistComplete && (
                <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-sm">
                  <WarningCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" weight="duotone" />
                  <p>Beberapa poin verifikasi belum terpenuhi. Lengkapi checklist ini sebelum melakukan konfirmasi broadcast.</p>
                </div>
              )}
              
              <div className="space-y-3 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checklist.identityComplete} onCheckedChange={() => handleCheck('identityComplete')} />
                  <span className="text-sm font-medium text-slate-700">Identitas pelapor lengkap</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checklist.whatsappVerified} onCheckedChange={() => handleCheck('whatsappVerified')} />
                  <span className="text-sm font-medium text-slate-700">Kontak WA terverifikasi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checklist.descriptionAdequate} onCheckedChange={() => handleCheck('descriptionAdequate')} />
                  <span className="text-sm font-medium text-slate-700">Deskripsi barang memadai</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checklist.photoAttached} onCheckedChange={() => handleCheck('photoAttached')} />
                  <span className="text-sm font-medium text-slate-700">Foto barang terlampir</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checklist.chronicleClear} onCheckedChange={() => handleCheck('chronicleClear')} />
                  <span className="text-sm font-medium text-slate-700">Kronologi kejadian jelas</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Admin Actions & Config */}
        <div className="flex flex-col gap-6">
          
          {/* 4.4 & 4.5 Status & Prioritas */}
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ubah Status</p>
              <select 
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value as ReportStatus)}
              >
                {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tingkat Prioritas</p>
              <select 
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
                value={localPriority}
                onChange={(e) => setLocalPriority(e.target.value as ReportPriority)}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* 4.3 Catatan Verifikator */}
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Catatan Internal (Admin)</p>
              <Textarea 
                placeholder="Catatan tidak terlihat oleh warga..."
                className="resize-none"
                rows={3}
                value={localAdminNotes}
                onChange={(e) => setLocalAdminNotes(e.target.value)}
              />
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Balasan ke Warga</p>
              <Textarea 
                placeholder="Pesan akan dikirim ke warga..."
                className="resize-none"
                rows={3}
                value={localAdminReply}
                onChange={(e) => setLocalAdminReply(e.target.value)}
              />
              {localStatus === 'rejected' && (
                <p className="text-xs text-red-500 mt-1">* Wajib diisi karena status Ditolak</p>
              )}
            </div>
          </Card>

          {/* 4.6 Konfigurasi Broadcast */}
          <Card className="rounded-2xl border border-blue-200 overflow-hidden shadow-sm bg-blue-50/20 p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">Konfigurasi Broadcast</h2>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Target RT</p>
              <div className="flex flex-wrap gap-2">
                {['01', '02', '03'].map(rt => (
                  <Badge 
                    key={rt}
                    className={`cursor-pointer transition-colors ${targetRTs.includes(rt) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => handleRTSelect(rt)}
                  >
                    RT {rt}
                  </Badge>
                ))}
                <Badge 
                    className={`cursor-pointer transition-colors ${targetRTs.length === 3 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setTargetRTs(targetRTs.length === 3 ? [] : ['01', '02', '03'])}
                  >
                    Semua RT
                  </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Saluran</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer bg-white p-2 border border-slate-200 rounded-lg">
                  <Checkbox checked={channels.includes('inapp')} onCheckedChange={() => handleChannelSelect('inapp')} />
                  <span className="text-sm font-medium text-slate-700">Notifikasi Dalam Aplikasi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white p-2 border border-slate-200 rounded-lg">
                  <Checkbox checked={channels.includes('whatsapp')} onCheckedChange={() => handleChannelSelect('whatsapp')} />
                  <span className="text-sm font-medium text-slate-700">WhatsApp Blast</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 mt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preview Pesan</p>
              <div className="text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
{`📢 Info Barang Hilang · RW 025

Warga kami melaporkan kehilangan ${data.item.name} pada ${data.incident.date} di sekitar ${data.incident.location}.

Ciri-ciri: ${data.item.description.substring(0, 100)}${data.item.description.length > 100 ? '...' : ''}

Jika menemukan, harap segera hubungi pengurus RW.

Tiket: ${data.ticketNumber}`}
              </div>
              <div className="mt-4 flex justify-end">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`📢 Info Barang Hilang · RW 025\n\nWarga kami melaporkan kehilangan ${data.item.name} pada ${data.incident.date} di sekitar ${data.incident.location}.\n\nCiri-ciri: ${data.item.description.substring(0, 100)}${data.item.description.length > 100 ? '...' : ''}\n\nJika menemukan, harap segera hubungi pengurus RW.\n\nTiket: ${data.ticketNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Kirim via WhatsApp
                </a>
              </div>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}
