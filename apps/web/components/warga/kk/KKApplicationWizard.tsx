'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FilePlus2, UserPlus, CheckCircle2, UploadCloud, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActionToast } from '@/lib/use-action-toast';
import { platformFetch } from '@/lib/api/platform';
import { RT_OPTIONS } from '@/lib/rt-options';

type SubmissionType = 'baru' | 'gabung' | null;

export default function KKApplicationWizard() {
  const router = useRouter();
  const { runWithToast, toast } = useActionToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submissionType, setSubmissionType] = useState<SubmissionType>(null);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [namaKepalaKeluarga, setNamaKepalaKeluarga] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  const [nomorKkUnik, setNomorKkUnik] = useState('');
  const [hubungan, setHubungan] = useState('');
  const [dokumenLampiran, setDokumenLampiran] = useState<File[]>([]);
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('25');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (dokumenLampiran.length + filesArray.length > 3) {
        toast({
          title: 'Maksimal 3 File',
          description: 'Anda hanya dapat melampirkan maksimal 3 dokumen.',
          variant: 'destructive',
        });
        return;
      }
      setDokumenLampiran((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setDokumenLampiran((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep2 = () => {
    if (submissionType === 'baru') {
      if (!namaKepalaKeluarga || !alamatLengkap || !rt) {
        toast({ title: 'Data Belum Lengkap', description: 'Harap isi semua kolom yang diwajibkan.', variant: 'destructive' });
        return;
      }
    } else {
      if (!nomorKkUnik || !hubungan) {
        toast({ title: 'Data Belum Lengkap', description: 'Harap isi semua kolom yang diwajibkan.', variant: 'destructive' });
        return;
      }
    }
    
    if (dokumenLampiran.length === 0) {
      toast({ title: 'Dokumen Kosong', description: 'Harap lampirkan setidaknya 1 dokumen pendukung.', variant: 'destructive' });
      return;
    }
    
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (submissionType === 'baru') {
        // Generate a temporary KK number based on timestamp for new KK submissions
        const timestamp = Date.now().toString().slice(-16).padStart(16, '0');
        await runWithToast(
          () =>
            platformFetch('/requests/household-create', {
              method: 'POST',
              body: JSON.stringify({
                kkNumber: timestamp,
                address: alamatLengkap,
                rt: rt,
                rw: rw,
              }),
            }),
          {
            loading: 'Mengirim pengajuan...',
            success: 'Pengajuan KK berhasil dikirim. Menunggu verifikasi admin.',
            error: 'Gagal mengirim pengajuan',
          }
        );
      } else {
        // For adding member to existing KK, use member-create endpoint
        await runWithToast(
          () =>
            platformFetch('/requests/member-create', {
              method: 'POST',
              body: JSON.stringify({
                nik: '', // Will be filled by admin
                name: namaKepalaKeluarga || 'Anggota Baru',
                gender: 'L',
                relationship: hubungan,
              }),
            }),
          {
            loading: 'Mengirim pengajuan...',
            success: 'Pengajuan tambah anggota berhasil dikirim. Menunggu verifikasi admin.',
            error: 'Gagal mengirim pengajuan',
          }
        );
      }
      
      router.push('/warga');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as 1 | 2);
            else router.push('/warga');
          }}
          className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:opacity-80"
        >
          <ChevronLeft className="h-5 w-5" />
          {step === 1 ? 'Kembali ke Beranda' : 'Kembali'}
        </button>
        <div className="text-sm font-medium text-gray-500">Langkah {step} dari 3</div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* STEP 1: Pilih Tipe Pengajuan */}
      {step === 1 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apa yang ingin Anda lakukan?</h1>
            <p className="mt-1 text-gray-500">Pilih jenis layanan Kartu Keluarga yang sesuai dengan kebutuhan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSubmissionType('baru');
                setStep(2);
              }}
              className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white p-6 text-center transition-all hover:border-blue-500 hover:shadow-md"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <FilePlus2 className="size-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Buat KK Baru</h2>
                <p className="mt-2 text-sm text-gray-500">Untuk keluarga baru atau pindahan dari luar daerah.</p>
              </div>
            </button>

            <button
              onClick={() => {
                router.push('/warga/kk/tambah-anggota');
              }}
              className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white p-6 text-center transition-all hover:border-sky-500 hover:shadow-md"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <UserPlus className="size-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tambah Anggota ke Keluarga</h2>
                <p className="mt-2 text-sm text-gray-500">Tambah anggota baru ke dalam Kartu Keluarga yang sudah terdaftar di RW ini.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Isi Data */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lengkapi Data Anda</h1>
            <p className="mt-1 text-gray-500">
              {submissionType === 'baru' ? 'Isi form pembuatan KK baru di bawah ini.' : 'Isi form penambahan anggota keluarga.'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm flex flex-col gap-5">
            {submissionType === 'baru' ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-900">Nama Kepala Keluarga <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Sesuai KTP" 
                    value={namaKepalaKeluarga} 
                    onChange={(e) => setNamaKepalaKeluarga(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-900">Alamat Lengkap di Lingkungan RW <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Nama jalan, Nomor rumah" 
                    value={alamatLengkap} 
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold text-gray-900">RT <span className="text-red-500">*</span></Label>
                    <Select value={rt} onValueChange={setRt}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih RT" />
                      </SelectTrigger>
                      <SelectContent>
                        {RT_OPTIONS.map((rtOption) => (
                          <SelectItem key={rtOption} value={rtOption}>
                            RT {rtOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold text-gray-900">RW</Label>
                    <Input 
                      value={rw} 
                      onChange={(e) => setRw(e.target.value)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-900">Nomor KK Unik Tujuan <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Contoh: RT01-KK-007" 
                    value={nomorKkUnik} 
                    onChange={(e) => setNomorKkUnik(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Tanyakan Nomor KK Unik ini kepada Kepala Keluarga tujuan.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-900">Hubungan dengan Kepala Keluarga <span className="text-red-500">*</span></Label>
                  <Select value={hubungan} onValueChange={setHubungan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Istri">Istri</SelectItem>
                      <SelectItem value="Anak">Anak</SelectItem>
                      <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                      <SelectItem value="Mertua">Mertua</SelectItem>
                      <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-5">
              <div>
                <Label className="text-sm font-semibold text-gray-900">Lampirkan Dokumen Pendukung <span className="text-red-500">*</span></Label>
                <p className="text-xs text-gray-500 mt-1">Format JPG/PDF, maksimal 3 file. (KTP, Surat Pindah, dll)</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 hover:bg-gray-100 cursor-pointer transition-colors">
                  <UploadCloud className="size-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-blue-600">Pilih Dokumen (Klik di sini)</span>
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileUpload} />
                </label>

                {dokumenLampiran.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {dokumenLampiran.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="size-4 text-blue-500 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-red-500 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded-md">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleNextStep2} className="w-full rounded-xl bg-blue-600 py-6 mt-4">
              Lanjutkan
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Konfirmasi */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Pengajuan</h1>
            <p className="mt-1 text-gray-500">Periksa kembali ringkasan pengajuan Anda sebelum dikirim ke admin RW.</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-blue-600" />
                Ringkasan Pengajuan
              </h2>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Tipe Pengajuan</div>
                  <div className="font-semibold text-gray-900">
                    {submissionType === 'baru' ? 'Buat KK Baru' : 'Tambah Anggota Keluarga'}
                  </div>
                </div>
                
                {submissionType === 'baru' ? (
                  <>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Nama KK</div>
                      <div className="font-semibold text-gray-900">{namaKepalaKeluarga}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Alamat</div>
                      <div className="text-gray-900">{alamatLengkap}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Nomor KK Tujuan</div>
                      <div className="font-semibold text-gray-900">{nomorKkUnik}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Hubungan</div>
                      <div className="font-semibold text-gray-900">{hubungan}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Dokumen Lampiran</div>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg font-medium">
                  <CheckCircle2 className="size-4" />
                  {dokumenLampiran.length} file telah dilampirkan
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-6 font-bold shadow-md hover:bg-blue-700"
          >
            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
          </Button>
        </div>
      )}
    </div>
  );
}
