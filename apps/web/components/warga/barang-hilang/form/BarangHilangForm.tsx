'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Info, UploadCloud, MapPin } from 'lucide-react';
import { LaporanFormValues, laporanFormSchema } from '@/lib/barang-hilang/schema';
import type { BackendBarangHilang } from '@/lib/barang-hilang-mapper';

import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authClient } from '@/lib/auth-client';
import { platformFetch, getPlatformErrorMessage } from '@/lib/api/platform';
import { useIdentity } from '@/app/(app)/warga/_components/identity-context';

export default function BarangHilangForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { userName, userEmail } = useIdentity();
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    authClient.getSession().then((res) => {
      const phone = (res?.data?.user as any)?.phoneNumber;
      if (phone) setPhoneNumber(phone);
    }).catch(() => null);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const [formData, setFormData] = useState<LaporanFormValues>({
    itemName: '',
    category: 'other',
    description: '',
    estimatedValue: '',
    color: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    chronicle: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LaporanFormValues, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name as keyof LaporanFormValues]) return prev;
      const next = { ...prev };
      delete next[name as keyof LaporanFormValues];
      return next;
    });
  };

  const handleSelectChange = (name: keyof LaporanFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const parsed = laporanFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LaporanFormValues, string>> = {};
      parsed.error.issues?.forEach((err) => {
        const field = err.path[0] as keyof LaporanFormValues;
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      toast({ title: 'Ada form yang belum lengkap', variant: 'destructive' });
      return;
    }

    try {
      const body = {
        itemName: parsed.data.itemName,
        category: parsed.data.category,
        itemDescription: parsed.data.description,
        color: parsed.data.color || undefined,
        estimatedValue: parsed.data.estimatedValue ? parseInt(parsed.data.estimatedValue, 10) : undefined,
        incidentDate: parsed.data.incidentDate,
        incidentTime: parsed.data.incidentTime || undefined,
        location: parsed.data.location,
        chronicle: parsed.data.chronicle,
        notes: parsed.data.notes || undefined,
      };

      const res = await platformFetch<BackendBarangHilang>('/barang-hilang', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      toast({
        title: 'Laporan Berhasil Dibuat',
        description: 'Laporan Anda telah masuk dan menunggu verifikasi Admin.',
        variant: 'success',
      });

      router.push(`/warga/barang-hilang/${res.data.id}`);
    } catch (err) {
      toast({
        title: 'Gagal Menyimpan',
        description: getPlatformErrorMessage(err, 'Terjadi kesalahan saat menyimpan laporan.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (photos.length + newFiles.length > 3) {
        toast({ title: 'Maksimal 3 foto', variant: 'destructive' });
        return;
      }
      setPhotos([...photos, ...newFiles]);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* SECTION 1: Identitas */}
      <div className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
        <div className="bg-primary/5 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
          <h2 className="font-bold text-slate-800 text-sm">Data Pelapor</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-xs flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Data diri Anda diisi otomatis dari akun yang sedang login.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={userName || '—'} readOnly className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input value={phoneNumber || userEmail || '—'} readOnly className="bg-slate-50" />
            </div>
          </div>
        </CardContent>
      </div>

      {/* SECTION 2: Barang */}
      <div className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
        <div className="bg-primary/5 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
          <h2 className="font-bold text-slate-800 text-sm">Detail Barang Hilang</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Nama Barang <span className="text-rose-500">*</span></Label>
            <Input name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Contoh: Dompet Kulit Pria" />
            {errors.itemName && <span className="text-[10px] text-rose-500">{errors.itemName}</span>}
          </div>

          <div className="space-y-2">
            <Label>Kategori <span className="text-rose-500">*</span></Label>
            <Select onValueChange={(val) => handleSelectChange('category', val)} value={formData.category}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet_bag">Dompet / Tas</SelectItem>
                <SelectItem value="vehicle">Kendaraan</SelectItem>
                <SelectItem value="electronic">Elektronik / HP</SelectItem>
                <SelectItem value="document">Dokumen / Surat</SelectItem>
                <SelectItem value="jewelry">Perhiasan</SelectItem>
                <SelectItem value="pet">Hewan Peliharaan</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <span className="text-[10px] text-rose-500">{errors.category}</span>}
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Lengkap <span className="text-rose-500">*</span></Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Sebutkan ciri-ciri spesifik (merk, isi di dalamnya, dll)" className="h-24" />
            {errors.description && <span className="text-[10px] text-rose-500">{errors.description}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Warna Dominan</Label>
              <Input name="color" value={formData.color} onChange={handleChange} placeholder="Opsional" />
            </div>
            <div className="space-y-2">
              <Label>Nilai Taksiran (Rp)</Label>
              <Input name="estimatedValue" value={formData.estimatedValue} onChange={handleChange} placeholder="Opsional" type="number" />
            </div>
          </div>
        </CardContent>
      </div>

      {/* SECTION 3: Kronologi */}
      <div className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
        <div className="bg-primary/5 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
          <h2 className="font-bold text-slate-800 text-sm">Waktu & Kronologi</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Hilang <span className="text-rose-500">*</span></Label>
              <Input name="incidentDate" value={formData.incidentDate} onChange={handleChange} type="date" />
              {errors.incidentDate && <span className="text-[10px] text-rose-500">{errors.incidentDate}</span>}
            </div>
            <div className="space-y-2">
              <Label>Perkiraan Jam</Label>
              <Input name="incidentTime" value={formData.incidentTime} onChange={handleChange} type="time" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lokasi Terakhir <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input name="location" value={formData.location} onChange={handleChange} className="pl-9" placeholder="Contoh: Depan warung Bu Yani" />
            </div>
            {errors.location && <span className="text-[10px] text-rose-500">{errors.location}</span>}
          </div>

          <div className="space-y-2">
            <Label>Kronologi Kejadian <span className="text-rose-500">*</span></Label>
            <Textarea name="chronicle" value={formData.chronicle} onChange={handleChange} placeholder="Ceritakan bagaimana barang tersebut bisa hilang secara detail..." className="h-28" />
            {errors.chronicle && <span className="text-[10px] text-rose-500">{errors.chronicle}</span>}
          </div>
        </CardContent>
      </div>

      {/* SECTION 4: Foto */}
      <div className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
        <div className="bg-primary/5 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div>
          <h2 className="font-bold text-slate-800 text-sm">Foto Barang (Opsional)</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-primary">Upload Foto Barang</p>
            <p className="text-xs text-slate-500 mt-1">Maks. 3 foto, ukuran 5 MB/foto.</p>
          </div>

          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photos.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded-md bg-slate-100 overflow-hidden border">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/50 text-white text-[10px] px-1 rounded-bl-md">X</button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      {/* SECTION 5: Catatan */}
      <div className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
        <div className="bg-primary/5 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">5</div>
          <h2 className="font-bold text-slate-800 text-sm">Catatan Tambahan</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Catatan untuk Admin (Opsional)</Label>
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Tambahkan pesan khusus jika ada" />
          </div>

          <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-full shadow-sm">
              {isSubmitting ? 'Memproses...' : 'Kirim Laporan'}
            </Button>
          </div>
        </CardContent>
      </div>

    </form>
  );
}
