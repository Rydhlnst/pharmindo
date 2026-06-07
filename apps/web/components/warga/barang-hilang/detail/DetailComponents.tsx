import { CheckCircle2, Clock, CheckCircle, PackageSearch, MessageSquareWarning, SearchX, Check } from 'lucide-react';
import type { LaporanBarangHilang, AuditLogItem } from '@/types/barang-hilang';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusDetails, formatDate } from '../LaporanCard';

export function StatusTracker({ status }: { status: LaporanBarangHilang['status'] }) {
  const steps = [
    { key: 'pending_verification', label: 'Terkirim', icon: Clock },
    { key: 'in_verification', label: 'Verifikasi', icon: PackageSearch },
    { key: 'processing', label: 'Diproses', icon: SearchX },
    { key: 'resolved', label: 'Selesai', icon: CheckCircle2 },
  ];

  let currentIndex = 0;
  if (status === 'resolved') currentIndex = 3;
  else if (status === 'processing') currentIndex = 2;
  else if (status === 'in_verification') currentIndex = 1;
  else if (status === 'rejected' || status === 'archived') {
    // If rejected, just stop at step 0 or 1 depending on when it was rejected.
    currentIndex = 1; 
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
      <CardContent className="p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Status Laporan</h3>
        <div className="relative flex justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" style={{ width: `${(currentIndex / 3) * 100}%` }}></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted && !isCurrent && idx < currentIndex ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-semibold ${isCompleted ? 'text-primary' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {status === 'archived' && (
          <div className="mt-5 bg-slate-100 text-slate-600 p-3 rounded-lg text-xs flex items-start gap-2">
            <MessageSquareWarning className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Laporan ini diarsipkan karena tidak ada pembaruan lebih dari 30 hari.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PesanAdmin({ status, reply }: { status: string, reply: string | null }) {
  if (!reply && status !== 'rejected') return null;

  const isRejected = status === 'rejected';
  
  return (
    <div className={`mb-6 p-4 rounded-xl flex gap-3 ${
      isRejected ? 'bg-rose-50 border border-rose-100' : 'bg-blue-50 border border-blue-100'
    }`}>
      {isRejected ? (
        <MessageSquareWarning className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
      )}
      <div>
        <h4 className={`text-sm font-bold mb-1 ${isRejected ? 'text-rose-800' : 'text-blue-800'}`}>
          {isRejected ? 'Laporan Ditolak' : 'Pesan dari Admin RW'}
        </h4>
        <p className={`text-xs leading-relaxed ${isRejected ? 'text-rose-700' : 'text-blue-700'}`}>
          {reply || 'Laporan Anda tidak memenuhi syarat. Silakan buat laporan baru dengan data yang lengkap.'}
        </p>
      </div>
    </div>
  );
}

export function RiwayatStatus({ logs }: { logs: AuditLogItem[] }) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
      <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
        <h3 className="font-bold text-slate-800 text-sm">Riwayat Laporan</h3>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-3 relative">
              {idx !== logs.length - 1 && (
                <div className="absolute left-[7px] top-5 w-[2px] h-full bg-slate-100 -z-10"></div>
              )}
              <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary shrink-0 mt-0.5 z-10"></div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{log.description}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
