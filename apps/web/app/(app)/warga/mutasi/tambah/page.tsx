'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Save,
  LogIn,
  LogOut,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  GitMerge,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { platformFetch } from '@/lib/api/platform';
import { useActionToast } from '@/lib/use-action-toast';
import { RT_OPTIONS } from '@/lib/rt-options';

const STEPS = [
  { id: 1, label: 'Jenis Mutasi' },
  { id: 2, label: 'Informasi' },
  { id: 3, label: 'Konfirmasi' },
] as const;

const ALASAN_PINDAH_OPTIONS = ['Pekerjaan', 'Pendidikan', 'Keluarga', 'Perumahan', 'Lainnya'];

export default function TambahMutasiPage() {
  const router = useRouter();
  const { runWithToast, toast } = useActionToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    jenisMutasi: '',
    tanggalMutasi: '',
    alamatLama: '',
    alamatBaru: '',
    rtTujuan: '',
    alasanPindah: '',
    telepon: '',
  });

  const [showExitModal, setShowExitModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const draft = localStorage.getItem('warga_mutasi_draft');
    if (draft) setShowDraftModal(true);
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.jenisMutasi) newErrors.jenisMutasi = 'Jenis mutasi wajib dipilih';
      if (!form.tanggalMutasi) newErrors.tanggalMutasi = 'Tanggal mutasi wajib diisi';
    }
    if (step === 2) {
      if (!form.alamatLama) newErrors.alamatLama = 'Alamat lama wajib diisi';
      if (!form.alamatBaru) newErrors.alamatBaru = 'Alamat baru wajib diisi';
      if (!form.rtTujuan) newErrors.rtTujuan = 'RT tujuan wajib dipilih';
      if (!form.alasanPindah) newErrors.alasanPindah = 'Alasan pindah wajib dipilih';
      if (!form.telepon) newErrors.telepon = 'Nomor telepon wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((p) => Math.min(STEPS.length, p + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({ title: 'Validasi gagal', description: 'Lengkapi semua data wajib', variant: 'destructive' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = () => {
    localStorage.setItem('warga_mutasi_draft', JSON.stringify(form));
    toast({ title: 'Draft tersimpan', description: 'Data berhasil disimpan sebagai draft.', variant: 'success' });
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem('warga_mutasi_draft');
    if (draft) setForm(JSON.parse(draft));
    setShowDraftModal(false);
  };

  const handleDeleteDraft = () => {
    localStorage.removeItem('warga_mutasi_draft');
    setShowDraftModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) return handleNext();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await runWithToast(
        async () => {
          await platformFetch('/requests/mutation', {
            method: 'POST',
            body: JSON.stringify({
              type: form.jenisMutasi === 'Mutasi Masuk' ? 'MUTATION_IN' : 'MUTATION_OUT',
              mutationDate: form.tanggalMutasi,
              fromAddress: form.alamatLama,
              toAddress: form.alamatBaru,
              targetRt: form.rtTujuan,
              phone: form.telepon,
              reason: form.alasanPindah,
            }),
          });
        },
        { loading: 'Mengirim permohonan...', success: 'Permohonan mutasi berhasil dikirim', error: 'Gagal mengirim mutasi' }
      );
      localStorage.removeItem('warga_mutasi_draft');
      router.push('/warga');
      router.refresh();
    } catch (err) {
      console.error('Gagal mengirim permohonan mutasi:', err);
      toast({ title: 'Terjadi kesalahan', description: 'Gagal mengirim permohonan mutasi. Silakan coba lagi.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="safe-top flex w-full flex-col gap-6 p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="flex items-center gap-1 text-sm md:text-base font-semibold text-blue-600 transition hover:opacity-80 bg-transparent border-none outline-none"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Keluar Halaman</span>
          <span className="sm:hidden">Keluar</span>
        </button>
        {currentStep < 3 && (
          <Button
            type="button"
            onClick={handleSaveDraft}
            variant="outline"
            className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-[#1E293B] transition hover:bg-gray-50"
          >
            <Save className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Simpan Draft</span>
          </Button>
        )}
      </div>

      {/* Title Card */}
      <div className="relative overflow-hidden rounded-[12px] bg-[#EFF6FF] p-4 md:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/[0.05]" />
        <div className="pointer-events-none absolute right-12 top-2 h-24 w-24 rounded-full bg-blue-500/[0.08]" />

        <div className="relative z-10 flex items-start md:items-center gap-3 mb-6">
          <div className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <GitMerge className="size-5 md:size-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">Pengajuan Mutasi</h1>
            <p className="mt-1 text-xs md:text-sm text-blue-600/80">Isi formulir pengajuan mutasi penduduk.</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative z-10 flex w-full items-center">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const circleClass = isActive
              ? 'bg-blue-600 text-white border-blue-600'
              : isCompleted
              ? 'bg-blue-100 text-blue-600 border-blue-300'
              : 'bg-white text-gray-400 border-gray-200';
            const labelClass = isActive
              ? 'text-blue-600 font-bold'
              : isCompleted
              ? 'text-blue-500 font-semibold'
              : 'text-gray-400 font-normal';
            return (
              <div key={step.id} className={`flex items-center ${idx < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${circleClass}`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                  </div>
                  <span className={`text-xs hidden md:block ${labelClass}`}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-2 md:mx-4 h-[2px] flex-1 rounded-full transition-all ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Step 1: Jenis Mutasi */}
        {currentStep === 1 && (
          <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="mb-4 md:mb-6 text-[18px] font-bold text-[#1E293B]">Jenis Mutasi</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => handleFieldChange('jenisMutasi', 'Mutasi Masuk')}
                className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 font-bold transition-all text-left ${
                  form.jenisMutasi === 'Mutasi Masuk'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-blue-200'
                }`}
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${form.jenisMutasi === 'Mutasi Masuk' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <LogIn className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-bold">Mutasi Masuk</div>
                  <div className="text-xs font-normal text-gray-500 mt-0.5">Pindah ke wilayah RW 25</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFieldChange('jenisMutasi', 'Mutasi Keluar')}
                className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 font-bold transition-all text-left ${
                  form.jenisMutasi === 'Mutasi Keluar'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-blue-200'
                }`}
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${form.jenisMutasi === 'Mutasi Keluar' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-bold">Mutasi Keluar</div>
                  <div className="text-xs font-normal text-gray-500 mt-0.5">Pindah keluar wilayah RW 25</div>
                </div>
              </button>
            </div>
            {errors.jenisMutasi && <p className="mt-2 text-sm text-red-500">{errors.jenisMutasi}</p>}

            <div className="mt-6">
              <Label className="mb-2 block text-sm font-semibold text-[#1E293B]">
                Tanggal Mutasi<span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.tanggalMutasi}
                onChange={(e) => handleFieldChange('tanggalMutasi', e.target.value)}
                className={`h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B] ${errors.tanggalMutasi ? 'border-red-500' : ''}`}
              />
              {errors.tanggalMutasi && <p className="mt-1 text-xs text-red-500">{errors.tanggalMutasi}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Informasi Alamat */}
        {currentStep === 2 && (
          <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="mb-4 md:mb-6 text-[18px] font-bold text-[#1E293B]">Informasi Alamat & Kontak</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-[#1E293B]">
                  Alamat Lama<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.alamatLama}
                  onChange={(e) => handleFieldChange('alamatLama', e.target.value)}
                  placeholder="Alamat asal sebelum pindah"
                  className={`h-11 rounded-xl border border-gray-200 px-4 ${errors.alamatLama ? 'border-red-500' : ''}`}
                />
                {errors.alamatLama && <p className="text-xs text-red-500">{errors.alamatLama}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-[#1E293B]">
                  Alamat Baru<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.alamatBaru}
                  onChange={(e) => handleFieldChange('alamatBaru', e.target.value)}
                  placeholder="Alamat tujuan setelah pindah"
                  className={`h-11 rounded-xl border border-gray-200 px-4 ${errors.alamatBaru ? 'border-red-500' : ''}`}
                />
                {errors.alamatBaru && <p className="text-xs text-red-500">{errors.alamatBaru}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-[#1E293B]">
                  RT Tujuan<span className="text-red-500">*</span>
                </Label>
                <Select value={form.rtTujuan} onValueChange={(v) => handleFieldChange('rtTujuan', v)}>
                  <SelectTrigger className={`[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B] ${errors.rtTujuan ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Pilih RT" />
                  </SelectTrigger>
                  <SelectContent>
                    {RT_OPTIONS.map((rt) => (
                      <SelectItem key={rt} value={rt} className="focus:bg-blue-50 focus:text-blue-600">
                        RT {rt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rtTujuan && <p className="text-xs text-red-500">{errors.rtTujuan}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-[#1E293B]">
                  Alasan Pindah<span className="text-red-500">*</span>
                </Label>
                <Select value={form.alasanPindah} onValueChange={(v) => handleFieldChange('alasanPindah', v)}>
                  <SelectTrigger className={`[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B] ${errors.alasanPindah ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Pilih alasan pindah" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALASAN_PINDAH_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a} className="focus:bg-blue-50 focus:text-blue-600">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.alasanPindah && <p className="text-xs text-red-500">{errors.alasanPindah}</p>}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-sm font-semibold text-[#1E293B]">
                  Nomor Telepon<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.telepon}
                  onChange={(e) => handleFieldChange('telepon', e.target.value)}
                  placeholder="08..."
                  className={`h-11 rounded-xl border border-gray-200 px-4 ${errors.telepon ? 'border-red-500' : ''}`}
                />
                {errors.telepon && <p className="text-xs text-red-500">{errors.telepon}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            {/* Alert */}
            <div className="flex items-start md:items-center gap-3 rounded-[12px] bg-[#EFF6FF] px-4 md:px-6 py-4 border border-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 md:mt-0" />
              <div>
                <p className="text-sm font-bold text-blue-600">Periksa kembali sebelum mengirim.</p>
                <p className="text-xs md:text-sm text-blue-600/80">Pastikan semua data sudah benar sebelum mengajukan permohonan mutasi.</p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="mb-4 flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-[#1E293B]">Detail Jenis Mutasi</h2>
              </div>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Jenis</span>
                  <span className="font-bold text-[#1E293B]">{form.jenisMutasi}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Tanggal</span>
                  <span className="font-bold text-[#1E293B]">{form.tanggalMutasi}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Alasan</span>
                  <span className="font-bold text-[#1E293B]">{form.alasanPindah}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-[#1E293B]">Alamat & Kontak</h2>
              </div>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Alamat Lama</span>
                  <span className="font-bold text-[#1E293B] text-right max-w-[60%]">{form.alamatLama}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Alamat Baru</span>
                  <span className="font-bold text-[#1E293B] text-right max-w-[60%]">{form.alamatBaru}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">RT Tujuan</span>
                  <span className="font-bold text-[#1E293B]">RT {form.rtTujuan}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-600">Telepon</span>
                  <span className="font-bold text-[#1E293B]">{form.telepon}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-2 flex flex-col-reverse md:flex-row justify-end gap-3 pb-8">
          <Button
            type="button"
            onClick={currentStep > 1 ? handlePrev : () => setShowExitModal(true)}
            variant="outline"
            className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 md:py-6 text-sm md:text-base font-semibold text-[#1E293B] transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep > 1 ? 'Kembali' : 'Batal'}
          </Button>

          {currentStep < 3 && (
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl border border-blue-500 bg-white px-8 py-4 md:py-6 text-sm md:text-base font-semibold text-blue-600 transition hover:bg-blue-50 shadow-sm md:hidden"
            >
              <Save className="h-4 w-4" />
              Simpan Draft
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 md:py-6 text-sm md:text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Lanjutkan
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 md:py-6 text-sm md:text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Memproses...' : 'Kirim Permohonan'}
            </Button>
          )}
        </div>
      </form>

      {/* Draft Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E293B]">Draft Tersimpan</DialogTitle>
            <DialogDescription className="text-sm text-[#64748B]">
              Lanjutkan pengajuan mutasi sebelumnya?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Button onClick={handleLoadDraft} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              Muat Draft
            </Button>
            <Button onClick={handleDeleteDraft} variant="outline" className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100">
              Hapus Draft
            </Button>
            <Button onClick={() => setShowDraftModal(false)} className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50">
              Mulai Baru
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E293B]">Keluar Halaman?</DialogTitle>
            <DialogDescription className="text-sm text-[#64748B]">
              Anda memiliki data yang belum disimpan. Apakah Anda ingin menyimpannya sebagai draft sebelum keluar?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Button
              onClick={() => { handleSaveDraft(); setShowExitModal(false); router.back(); }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Simpan Draft & Keluar
            </Button>
            <Button
              onClick={() => { setShowExitModal(false); router.back(); }}
              variant="outline"
              className="w-full rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 hover:text-red-700"
            >
              Keluar Tanpa Menyimpan
            </Button>
            <Button
              onClick={() => setShowExitModal(false)}
              variant="ghost"
              className="w-full rounded-xl text-[#64748B] transition hover:bg-gray-100"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
