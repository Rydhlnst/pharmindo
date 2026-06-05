'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { platformFetch } from '@/lib/api/platform';
import { useActionToast } from '@/lib/use-action-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type HouseholdDetail = {
  id: string;
  kkNumber: string;
  address: string;
  rt: string;
  rw: string;
  headCitizen?: { name: string };
};

const INITIAL_FORM = {
  nik: '',
  name: '',
  birthDate: '',
  birthPlace: '',
  gender: '',
  relationship: '',
  maritalStatus: '',
  religion: '',
  education: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TambahAnggotaKeluargaPage() {
  const router = useRouter();
  const { runWithToast, toast } = useActionToast();

  // KK Info
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [loadingHousehold, setLoadingHousehold] = useState(true);
  const [noKkError, setNoKkError] = useState(false);

  // Form state
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Draft & Exit modal
  const householdId = household?.id ?? 'draft';
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Load current user's household membership
  useEffect(() => {
    async function load() {
      try {
        // Try to load from /requests to check if user has submitted a household
        const response = await platformFetch<{ id: string; kkNumber: string; address: string; rt: string; rw: string; headCitizen?: { name: string } }>(
          '/admin/households/my'
        ).catch(() => null);

        if (response?.data) {
          setHousehold(response.data);
        } else {
          // Fallback: show placeholder so form can still be used
          // Backend will reject if no KK exists
          setHousehold({
            id: 'current',
            kkNumber: 'KK Anda',
            address: '-',
            rt: '-',
            rw: '-',
            headCitizen: { name: 'Kepala Keluarga Anda' },
          });
        }
      } catch (err) {
        console.error(err);
        setHousehold({
          id: 'current',
          kkNumber: 'KK Anda',
          address: '-',
          rt: '-',
          rw: '-',
          headCitizen: { name: 'Kepala Keluarga Anda' },
        });
      } finally {
        setLoadingHousehold(false);
      }
    }
    void load();
  }, []);

  // Draft persistence
  useEffect(() => {
    const saved = localStorage.getItem(`draft_tambah_anggota_${householdId}`);
    if (saved) setHasDraft(true);
  }, [householdId]);

  const handleSaveDraft = () => {
    localStorage.setItem(`draft_tambah_anggota_${householdId}`, JSON.stringify({ form }));
    setHasDraft(true);
    toast({ title: 'Draft tersimpan', description: 'Data berhasil disimpan sebagai draft.', variant: 'success' });
  };

  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem(`draft_tambah_anggota_${householdId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
      }
      setShowDraftModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDraft = () => {
    localStorage.removeItem(`draft_tambah_anggota_${householdId}`);
    setHasDraft(false);
    setShowDraftModal(false);
    setForm(INITIAL_FORM);
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nik || form.nik.length < 16) {
      setError('NIK harus minimal 16 digit');
      return;
    }
    if (!form.name || !form.gender || !form.relationship || !form.religion || !form.education) {
      setError('Semua field yang bertanda bintang (*) wajib diisi');
      return;
    }

    setLoading(true);

    try {
      await runWithToast(
        async () => {
          await platformFetch('/requests/member-create', {
            method: 'POST',
            body: JSON.stringify({
              nik: form.nik,
              name: form.name,
              birthPlace: form.birthPlace || '-',
              birthDate: form.birthDate
                ? new Date(form.birthDate).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10),
              gender: form.gender,
              religion: form.religion,
              maritalStatus: form.maritalStatus || 'Belum Kawin',
              education: form.education,
              relationship: form.relationship,
            }),
          });
        },
        {
          loading: 'Menambahkan anggota keluarga...',
          success: 'Permohonan tambah anggota berhasil dikirim',
          error: 'Gagal menambahkan anggota keluarga',
        }
      );

      localStorage.removeItem(`draft_tambah_anggota_${householdId}`);
      router.push('/warga/kk');
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Terjadi kesalahan saat menyimpan anggota keluarga';
      setError(msg);

      // If user doesn't belong to a household, show special error
      if (msg.toLowerCase().includes('household')) {
        setNoKkError(true);
      }
    } finally {
      setLoading(false);
    }
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
        <Button
          onClick={() => {
            if (hasDraft) {
              setShowDraftModal(true);
              return;
            }
            toast({
              title: 'Belum ada draft',
              description: 'Simpan draft terlebih dahulu untuk membukanya kembali.',
              variant: 'destructive',
            });
          }}
          variant="outline"
          className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-[#1E293B] transition hover:bg-gray-50"
        >
          <Save className="h-4 w-4 text-blue-500" />
          <span className="hidden sm:inline">Draft</span>
          {hasDraft && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />}
        </Button>
      </div>

      {/* Title Card */}
      <div className="relative overflow-hidden rounded-[12px] bg-[#EFF6FF] p-4 md:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/[0.05]" />
        <div className="pointer-events-none absolute right-12 top-2 h-24 w-24 rounded-full bg-blue-500/[0.08]" />

        <div className="relative z-10 flex items-start md:items-center gap-3">
          <div className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Users className="size-5 md:size-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">Tambah Anggota Keluarga</h1>
            <p className="mt-1 text-xs md:text-sm text-blue-600/80">
              {loadingHousehold
                ? 'Memuat data KK...'
                : `KK: ${household?.kkNumber ?? '-'} · Kepala: ${household?.headCitizen?.name ?? '-'}`}
            </p>
          </div>
        </div>
      </div>

      {/* No-KK warning */}
      {noKkError && (
        <div className="flex items-start gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-700">Anda belum memiliki Kartu Keluarga aktif</p>
            <p className="mt-1 text-xs text-amber-600">
              Untuk menambah anggota keluarga, Anda harus terlebih dahulu terdaftar dalam Kartu Keluarga.{' '}
              <Link href="/warga/kk/tambah" className="underline font-semibold">
                Ajukan KK baru
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start md:items-center gap-3 rounded-[12px] bg-[#EFF6FF] px-4 md:px-6 py-4 border border-blue-100">
        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 md:mt-0" />
        <div>
          <p className="text-sm font-bold text-blue-600">Periksa kembali sebelum menyimpan.</p>
          <p className="text-xs md:text-sm text-blue-600/80">
            Pastikan semua data sudah benar. Permohonan akan masuk ke admin untuk ditinjau.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form id="anggota-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Identitas Personal */}
        <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 className="mb-5 text-[18px] font-bold text-[#1E293B]">Identitas Personal</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Nomor Induk Kependudukan (NIK)<span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.nik}
                onChange={(e: any) => handleFieldChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="16 digit NIK"
                maxLength={16}
                inputMode="numeric"
                className="h-11 rounded-xl border border-gray-200 px-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Nama Lengkap<span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e: any) => handleFieldChange('name', e.target.value)}
                placeholder="Sesuai KTP"
                className="h-11 rounded-xl border border-gray-200 px-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">Tanggal Lahir</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e: any) => handleFieldChange('birthDate', e.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">Tempat Lahir</Label>
              <Input
                value={form.birthPlace}
                onChange={(e: any) => handleFieldChange('birthPlace', e.target.value)}
                placeholder="Contoh: Bandung"
                className="h-11 rounded-xl border border-gray-200 px-4"
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Jenis Kelamin<span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(val) => handleFieldChange('gender', val)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="L" id="r-laki" />
                  <Label htmlFor="r-laki" className="cursor-pointer text-sm font-medium text-[#64748B]">
                    Laki-Laki
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="P" id="r-perempuan" />
                  <Label htmlFor="r-perempuan" className="cursor-pointer text-sm font-medium text-[#64748B]">
                    Perempuan
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Hubungan Status */}
        <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 className="mb-5 text-[18px] font-bold text-[#1E293B]">Hubungan & Status</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Hubungan dalam Keluarga<span className="text-red-500">*</span>
              </Label>
              <Select value={form.relationship} onValueChange={(val) => handleFieldChange('relationship', val)}>
                <SelectTrigger className="[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B]">
                  <SelectValue placeholder="Pilih Hubungan" />
                </SelectTrigger>
                <SelectContent>
                  {['Kepala Keluarga', 'Suami', 'Istri', 'Anak', 'Orang Tua', 'Mertua', 'Cucu', 'Lainnya'].map((v) => (
                    <SelectItem key={v} value={v} className="focus:bg-blue-50 focus:text-blue-600">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">Status Perkawinan</Label>
              <Select value={form.maritalStatus} onValueChange={(val) => handleFieldChange('maritalStatus', val)}>
                <SelectTrigger className="[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B]">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'].map((v) => (
                    <SelectItem key={v} value={v} className="focus:bg-blue-50 focus:text-blue-600">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="rounded-[12px] bg-white px-4 md:px-6 py-4 md:py-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 className="mb-5 text-[18px] font-bold text-[#1E293B]">Informasi Tambahan</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Agama<span className="text-red-500">*</span>
              </Label>
              <Select value={form.religion} onValueChange={(val) => handleFieldChange('religion', val)}>
                <SelectTrigger className="[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B]">
                  <SelectValue placeholder="Pilih Agama" />
                </SelectTrigger>
                <SelectContent>
                  {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((v) => (
                    <SelectItem key={v} value={v} className="focus:bg-blue-50 focus:text-blue-600">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-[#1E293B]">
                Pendidikan Terakhir<span className="text-red-500">*</span>
              </Label>
              <Select value={form.education} onValueChange={(val) => handleFieldChange('education', val)}>
                <SelectTrigger className="[&>svg]:text-blue-600 [&>svg]:opacity-100 h-11 rounded-xl border border-gray-200 px-4 text-[#1E293B]">
                  <SelectValue placeholder="Pilih Pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Tidak/Belum Sekolah',
                    'SD/Sederajat',
                    'SMP/Sederajat',
                    'SMA/Sederajat',
                    'Diploma I/II',
                    'Akademi/Diploma III/S.Muda',
                    'Diploma IV/Strata I',
                    'Strata II',
                    'Strata III',
                  ].map((v) => (
                    <SelectItem key={v} value={v} className="focus:bg-blue-50 focus:text-blue-600">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex flex-col-reverse md:flex-row justify-end gap-3 pb-8">
          <Button
            type="button"
            onClick={handleSaveDraft}
            variant="outline"
            className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl border border-blue-500 bg-white px-8 py-4 md:py-6 text-sm md:text-base font-semibold text-blue-600 transition hover:bg-blue-50 shadow-sm"
          >
            <Save className="h-5 w-5" />
            Simpan Draft
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 md:py-6 text-sm md:text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Kirim Permohonan'}
          </Button>
        </div>
      </form>

      {/* Draft Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E293B]">Draft Tersimpan</DialogTitle>
            <DialogDescription className="text-sm text-[#64748B]">
              Anda memiliki draft formulir yang belum selesai. Ingin memuat ulang atau menghapusnya?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Button onClick={handleLoadDraft} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              Muat Draft
            </Button>
            <Button onClick={handleDeleteDraft} className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100">
              Hapus Draft
            </Button>
            <Button onClick={() => setShowDraftModal(false)} className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50">
              Tutup
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
              Anda memiliki data yang belum disimpan. Ingin menyimpan sebagai draft sebelum keluar?
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
