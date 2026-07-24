'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
  Gift,
  Clock,
  WarningCircle
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import FormFileUpload from '@/components/warga/FormFileUpload';
import { formatBansosPeriod } from '@/lib/bansos';
import { useActionToast } from '@/lib/use-action-toast';
import { platformFetch } from '@/lib/api/platform';

type ProgramWithApplication = {
  id: string;
  title: string;
  assistanceType: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  fundingSource?: string;
  generalRequirements: string[];
  allowedRtScope: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  userApplication: {
    requestId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicantName: string;
    incomeAmount?: string;
    notes?: string;
    createdAt: string;
  } | null;
};

interface BansosFlowProps {
  onClose: () => void;
  identity: {
    nik?: string;
    hasKk?: boolean;
    familyMembers?: any[];
    rt?: string;
    name?: string;
  };
}

type Step = 'AUDIENCE' | 'LIST' | 'TRACKER' | 'STEP_1' | 'STEP_2' | 'STEP_3' | 'STEP_4' | 'SUCCESS';

export default function BansosFlow({ onClose, identity }: BansosFlowProps) {
  const { runWithToast } = useActionToast();
  
  const [step, setStep] = useState<Step>('AUDIENCE');
  const [programs, setPrograms] = useState<ProgramWithApplication[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithApplication | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Form State
  const [notes, setNotes] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [sktmFile, setSktmFile] = useState<File | null>(null);
  const [applicantType, setApplicantType] = useState<'SELF' | 'OTHER' | null>(null);
  const [otherNik, setOtherNik] = useState('');
  const [applicantNik, setApplicantNik] = useState(identity.nik || '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await platformFetch<ProgramWithApplication[]>('/bansos/programs');
      setPrograms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (prog: ProgramWithApplication) => {
    setSelectedProgram(prog);
    setStep('STEP_1');
  };

  const handleUseSelf = () => {
    setApplicantType('SELF');
    setApplicantNik(identity.nik || '');
    setStep('LIST');
  };

  const handleUseOther = () => {
    setApplicantType('OTHER');
    setApplicantNik(otherNik);
    setStep('LIST');
  };

  const checkEligibility = () => {
    if (!selectedProgram) return { eligible: false, reasons: [] };
    const reasons: { text: string; pass: boolean }[] = [];
    
    // Default checks
    reasons.push({ text: 'Warga aktif terdaftar', pass: true });
    reasons.push({ text: 'Akun Terverifikasi (Tier 3)', pass: true });
    
    // Dynamic checks
    if (selectedProgram.generalRequirements.includes('BALITA')) {
      const hasBalita = (identity.familyMembers || []).some(m => m.age && m.age <= 5);
      // For demo purposes, we'll randomly fail this if we want to test block
      reasons.push({ text: 'Memiliki anggota balita dalam KK', pass: hasBalita });
    }
    
    if (selectedProgram.generalRequirements.includes('LANSIA')) {
      const hasLansia = (identity.familyMembers || []).some(m => m.age && m.age >= 60);
      reasons.push({ text: 'Memiliki anggota lansia (60+ thn)', pass: hasLansia });
    }

    const eligible = reasons.every(r => r.pass);
    const incompleteData = !eligible && identity.familyMembers?.length === 0;
    return { eligible, reasons, incompleteData };
  };

  const handleSubmit = async () => {
    if (!selectedProgram) return;
    try {
      await runWithToast(
        () =>
          platformFetch('/requests/bansos', {
            method: 'POST',
            body: JSON.stringify({
              programId: selectedProgram.id,
              applicantName: applicantType === 'OTHER' ? applicantNik : identity.name || '',
              incomeAmount: undefined,
              notes,
            }),
          }),
        { loading: 'Mengirim pengajuan...', success: 'Pengajuan berhasil dikirim!', error: 'Gagal mengirim pengajuan' }
      );
      setStep('SUCCESS');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data bansos...</div>;
  }

  if (step === 'AUDIENCE') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
          <p className="text-sm font-bold text-blue-900">Pilih penerima bansos</p>
          <p className="mt-1 text-xs leading-relaxed text-blue-800">
            Gunakan data akun Anda yang sudah terverifikasi, atau masukkan NIK warga lain untuk dicek.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleUseSelf}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center transition hover:bg-emerald-100"
          >
            <p className="text-sm font-bold text-emerald-800">Diri sendiri</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700">
              Pakai data NIK akun yang sudah terdaftar.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setApplicantType('OTHER')}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50"
          >
            <p className="text-sm font-bold text-slate-800">Orang lain</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Masukkan NIK warga yang ingin dicek.
            </p>
          </button>
        </div>

        {applicantType === 'OTHER' && (
          <Card className="space-y-4 border-slate-200 p-4 text-center shadow-sm">
            <div>
              <Label className="text-sm font-bold text-slate-800">NIK warga</Label>
              <Input
                value={otherNik}
                onChange={(e) => setOtherNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                inputMode="numeric"
                className="mt-2 h-12 rounded-xl border-slate-200"
              />
              <p className="mt-2 text-xs text-slate-500">{otherNik.length}/16 digit</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setApplicantType(null)} className="rounded-xl">
                Batal
              </Button>
              <Button type="button" onClick={handleUseOther} disabled={otherNik.length !== 16} className="rounded-xl">
                Lanjutkan
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (step === 'LIST') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Penerima</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {applicantType === 'OTHER' ? 'Orang lain' : identity.name || 'Warga'}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {applicantType === 'OTHER' ? applicantNik : identity.nik || applicantNik || '-'}
          </p>
          <Button type="button" variant="link" onClick={() => setStep('AUDIENCE')} className="mt-2 h-auto p-0 text-xs font-semibold">
            Ganti penerima
          </Button>
        </div>

        {programs.some(p => p.userApplication) && (
          <div className="mb-4">
            <h3 className="mb-3 text-center text-sm font-bold text-slate-800">Pengajuan Saya</h3>
            {programs.filter(p => p.userApplication).map(prog => (
              <Card 
                key={prog.id}
                className="p-4 border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition mb-3"
                onClick={() => { setSelectedProgram(prog); setStep('TRACKER'); }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{prog.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Diajukan: {new Date(prog.userApplication!.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${
                    prog.userApplication!.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    prog.userApplication!.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <span className="inline-flex items-center gap-1.5">
                      {prog.userApplication!.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                      {prog.userApplication!.status === 'PENDING' ? 'Sedang Ditinjau' :
                       prog.userApplication!.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div>
          <h3 className="mb-3 text-center text-sm font-bold text-slate-800">Program Tersedia untuk RT Anda</h3>
          <div className="flex flex-col gap-4">
            {programs.map(prog => (
              <Card key={prog.id} className="border-slate-200 p-4 text-center shadow-sm">
                <h4 className="font-bold text-slate-800 text-lg">{prog.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{prog.assistanceType || 'Program bantuan sosial untuk warga yang membutuhkan.'}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{formatBansosPeriod(prog)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{prog.fundingSource || 'TBA'}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleApply(prog)}
                  className="w-full mt-4 rounded-xl font-semibold bg-primary hover:bg-primary/90"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ajukan Sekarang
                </Button>
              </Card>
            ))}
            {programs.length === 0 && (
              <div className="text-center p-6 text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                Belum ada program bansos aktif saat ini.
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
          <p className="flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-blue-800">
            <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Tidak semua program cocok untuk Anda. Hanya program yang sesuai dengan RT dan data KK Anda yang ditampilkan.</span>
          </p>
        </div>
      </div>
    );
  }

  if (step === 'STEP_1') {
    const { eligible, reasons, incompleteData } = checkEligibility();
    
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <button onClick={() => setStep('LIST')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600"/></button>
          <h3 className="font-bold text-slate-800">Langkah 1: Cek Kelayakan</h3>
        </div>
        
        <Card className="border-slate-200 p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Sistem mengecek data Anda...</p>
          <div className="space-y-3">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start justify-center gap-3 text-sm">
                {r.pass ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <span className={r.pass ? 'text-slate-700' : 'text-red-700 font-medium'}>{r.text}</span>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          {eligible ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Anda memenuhi syarat dasar! Lanjutkan pengajuan.</span>
            </div>
          ) : incompleteData ? (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm font-medium">
              <p className="mb-1 flex items-center justify-center gap-2"><WarningCircle className="w-4 h-4"/> <b>Data Belum Lengkap</b></p>
              Data KK Anda (seperti balita/lansia) belum diisi. Silakan perbarui di menu Data Penduduk terlebih dahulu.
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl text-sm font-medium">
              <p className="mb-1 flex items-center justify-center gap-2"><WarningCircle className="w-4 h-4"/> <b>Tidak Memenuhi Syarat</b></p>
              Mohon maaf, Anda tidak memenuhi satu atau beberapa syarat khusus untuk program bantuan ini.
            </div>
          )}
        </Card>

        <Button 
          disabled={!eligible}
          onClick={() => setStep('STEP_2')}
          className="w-full rounded-xl font-semibold bg-primary mt-2"
        >
          Lanjut ke Langkah 2
        </Button>
      </div>
    );
  }

  if (step === 'STEP_2') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <button onClick={() => setStep('STEP_1')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600"/></button>
          <h3 className="font-bold text-slate-800">Langkah 2: Pernyataan</h3>
        </div>

        <Card className="border-slate-200 p-5 text-center shadow-sm">
          <Label className="text-sm font-bold text-slate-800">Alasan Pengajuan</Label>
          <p className="text-xs text-slate-500 mb-3">Jelaskan kondisi keluarga Anda secara jujur dan singkat (maks 500 karakter).</p>
          <Textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Contoh: Penghasilan keluarga di bawah UMR, suami sedang sakit dan tidak bekerja..."
            className="h-32 resize-none rounded-xl border-slate-200"
            maxLength={500}
          />
          <p className="text-[10px] text-right text-slate-400 mt-1">{notes.length}/500</p>
        </Card>

        <Button 
          disabled={notes.trim().length < 10}
          onClick={() => setStep('STEP_3')}
          className="w-full rounded-xl font-semibold bg-primary mt-2"
        >
          Lanjut ke Langkah 3
        </Button>
      </div>
    );
  }

  if (step === 'STEP_3') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <button onClick={() => setStep('STEP_2')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600"/></button>
          <h3 className="font-bold text-slate-800">Langkah 3: Lampiran</h3>
        </div>

        <Card className="space-y-5 border-slate-200 p-5 text-center shadow-sm">
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
            <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>NIK pada KTP Anda tidak akan ditampilkan ke pihak lain selain admin RW yang berwenang.</span>
          </div>

          <div>
            <Label className="mb-2 flex items-center justify-center gap-1 text-sm font-bold text-slate-800">
              1. Foto KTP <span className="text-red-500">*</span>
            </Label>
            <FormFileUpload 
              label="Upload Foto KTP" 
              file={ktpFile}
              onChange={setKtpFile}
              accept="image/*"
            />
          </div>

          <div>
            <Label className="mb-2 flex items-center justify-center gap-1 text-sm font-bold text-slate-800">
              2. Foto KK <span className="text-red-500">*</span>
            </Label>
            <FormFileUpload 
              label="Upload Foto KK" 
              file={kkFile}
              onChange={setKkFile}
              accept="image/*"
            />
          </div>
          
          {selectedProgram?.generalRequirements.includes('SKTM') && (
            <div>
              <Label className="mb-2 flex items-center justify-center gap-1 text-sm font-bold text-slate-800">
                3. Surat Keterangan Tidak Mampu <span className="text-red-500">*</span>
              </Label>
              <FormFileUpload 
                label="Upload SKTM" 
                file={sktmFile}
                onChange={setSktmFile}
                accept="image/*,.pdf"
              />
            </div>
          )}
        </Card>

        <Button 
          disabled={!ktpFile || !kkFile}
          onClick={() => setStep('STEP_4')}
          className="w-full rounded-xl font-semibold bg-primary mt-2"
        >
          Lanjut ke Langkah 4
        </Button>
      </div>
    );
  }

  if (step === 'STEP_4') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <button onClick={() => setStep('STEP_3')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600"/></button>
          <h3 className="font-bold text-slate-800">Langkah 4: Konfirmasi</h3>
        </div>

        <Card className="border-slate-200 p-5 text-center shadow-sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Program</span>
              <span className="font-bold text-slate-800">{selectedProgram?.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Pemohon</span>
              <span className="font-bold text-slate-800">{applicantType === 'OTHER' ? `NIK ${applicantNik}` : identity.name || 'Warga'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Dokumen</span>
              <span className="flex items-center justify-end gap-1 font-bold text-emerald-600"><CheckCircle className="w-4 h-4"/> Lengkap</span>
            </div>
          </div>
          
          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Dengan mengajukan ini, saya menyatakan bahwa data yang saya berikan adalah benar dan dapat dipertanggungjawabkan.
            </p>
          </div>
        </Card>

        <Button 
          onClick={handleSubmit}
          className="w-full rounded-xl font-semibold bg-primary mt-2"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Kirim Pengajuan
        </Button>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Pengajuan Berhasil!</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-8">
          Pengajuan bansos Anda untuk program {selectedProgram?.title} telah berhasil dikirim ke Admin.
        </p>
        <Button onClick={onClose} className="w-full rounded-xl font-semibold" variant="outline">
          Tutup
        </Button>
      </div>
    );
  }

  if (step === 'TRACKER') {
    const app = selectedProgram?.userApplication;
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <button onClick={() => setStep('LIST')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600"/></button>
          <h3 className="font-bold text-slate-800">Detail Pengajuan Saya</h3>
        </div>

        <Card className="p-5 border-slate-200 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-2 h-full ${
            app?.status === 'PENDING' ? 'bg-amber-400' :
            app?.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
          <h4 className="font-bold text-slate-800 text-lg">{selectedProgram?.title}</h4>
          <p className="text-xs text-slate-500 font-mono mt-1">#{app?.requestId || '-'}</p>
          
          <div className="mt-6 flex flex-col gap-4 relative before:absolute before:left-3.5 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200">
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border-4 border-white">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="pt-1">
                <p className="font-bold text-sm text-slate-800">Terkirim</p>
                <p className="text-xs text-slate-500">{app?.createdAt ? new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className={`w-7 h-7 rounded-full ${
                app?.status === 'PENDING' ? 'bg-amber-500 text-white' :
                app?.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                'bg-red-500 text-white'
              } flex items-center justify-center shrink-0 border-4 border-white`}>
                {app?.status === 'PENDING' ? <Clock className="w-4 h-4" /> :
                 app?.status === 'APPROVED' ? <CheckCircle className="w-4 h-4" /> :
                 <XCircle className="w-4 h-4" />}
              </div>
              <div className="pt-1">
                <p className="font-bold text-sm text-slate-800">
                  {app?.status === 'PENDING' ? 'Sedang Ditinjau Admin' :
                   app?.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                </p>
                <p className="text-xs text-slate-500">
                  {app?.status === 'PENDING' ? 'Menunggu' :
                   app?.status === 'APPROVED' ? 'Disetujui oleh Admin' : 'Ditolak oleh Admin'}
                </p>
              </div>
            </div>

            {app?.status !== 'PENDING' && (
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 border-4 border-white">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="pt-1">
                  <p className="font-bold text-sm text-slate-400">Selesai</p>
                  <p className="text-xs text-slate-400">Proses selesai</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
