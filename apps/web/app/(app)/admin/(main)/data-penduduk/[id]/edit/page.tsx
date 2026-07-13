'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { platformFetch } from '@/lib/api/platform';
import { RT_OPTIONS } from '@/lib/rt-options';
import { useActionToast } from '@/lib/use-action-toast';

type CitizenForm = {
  name: string;
  nik: string;
  gender: 'L' | 'P' | '';
  birthPlace: string;
  birthDate: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  education: string;
  bloodType: string;
  address: string;
  rt: string;
  rw: string;
  status: 'PENDUDUK_TETAP' | 'NGEKOST';
};

const EMPTY: CitizenForm = {
  name: '', nik: '', gender: '', birthPlace: '', birthDate: '',
  religion: '', maritalStatus: '', occupation: '', education: '',
  bloodType: '', address: '', rt: '', rw: '25', status: 'PENDUDUK_TETAP',
};

export default function EditCitizenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { runWithToast } = useActionToast();
  const [form, setForm] = useState<CitizenForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await platformFetch<CitizenForm & { id: string }>(`/admin/citizens/${id}`);
        if (!active) return;
        const d = res.data;
        setForm({
          name: d.name ?? '',
          nik: d.nik ?? '',
          gender: (d.gender as CitizenForm['gender']) ?? '',
          birthPlace: d.birthPlace ?? '',
          birthDate: (d.birthDate ?? '').slice(0, 10),
          religion: d.religion ?? '',
          maritalStatus: d.maritalStatus ?? '',
          occupation: d.occupation ?? '',
          education: d.education ?? '',
          bloodType: d.bloodType ?? '',
          address: d.address ?? '',
          rt: d.rt ?? '',
          rw: d.rw ?? '25',
          status: (d.status as CitizenForm['status']) ?? 'PENDUDUK_TETAP',
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  const set = <K extends keyof CitizenForm>(k: K, v: CitizenForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await runWithToast(
        () =>
          platformFetch(`/admin/citizens/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              name: form.name,
              nik: form.nik,
              gender: form.gender,
              birthPlace: form.birthPlace,
              birthDate: form.birthDate,
              religion: form.religion,
              maritalStatus: form.maritalStatus,
              occupation: form.occupation,
              education: form.education,
              bloodType: form.bloodType || undefined,
              address: form.address,
              rt: form.rt,
              rw: form.rw,
              status: form.status,
            }),
          }),
        {
          loading: 'Menyimpan perubahan...',
          success: 'Data warga berhasil diperbarui',
          error: 'Gagal memperbarui data warga',
        },
      );
      router.push(`/admin/data-penduduk/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Memuat data warga...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/data-penduduk/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-[#1E293B]">Edit Data Warga</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label>Nama Lengkap</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <Label>NIK</Label>
            <Input value={form.nik} onChange={(e) => set('nik', e.target.value.replace(/\D/g, ''))} maxLength={16} required />
          </div>
          <div>
            <Label>Jenis Kelamin</Label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value as CitizenForm['gender'])} className="h-10 w-full rounded-md border px-3 text-sm">
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <Label>Tanggal Lahir</Label>
            <Input type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} required />
          </div>
          <div>
            <Label>Tempat Lahir</Label>
            <Input value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} required />
          </div>
          <div>
            <Label>Agama</Label>
            <Input value={form.religion} onChange={(e) => set('religion', e.target.value)} required />
          </div>
          <div>
            <Label>Status Perkawinan</Label>
            <Input value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)} required />
          </div>
          <div>
            <Label>Pekerjaan</Label>
            <Input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} required />
          </div>
          <div>
            <Label>Pendidikan</Label>
            <Input value={form.education} onChange={(e) => set('education', e.target.value)} required />
          </div>
          <div>
            <Label>Golongan Darah</Label>
            <Input value={form.bloodType} onChange={(e) => set('bloodType', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Alamat</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} required />
          </div>
          <div>
            <Label>RT</Label>
            <select value={form.rt} onChange={(e) => set('rt', e.target.value)} className="h-10 w-full rounded-md border px-3 text-sm">
              <option value="">Pilih RT</option>
              {RT_OPTIONS.map((rt) => <option key={rt} value={rt}>RT {rt}</option>)}
            </select>
          </div>
          <div>
            <Label>RW</Label>
            <Input value={form.rw} onChange={(e) => set('rw', e.target.value)} required />
          </div>
          <div>
            <Label>Status Kependudukan</Label>
            <select value={form.status} onChange={(e) => set('status', e.target.value as CitizenForm['status'])} className="h-10 w-full rounded-md border px-3 text-sm">
              <option value="PENDUDUK_TETAP">Penduduk Tetap</option>
              <option value="NGEKOST">Penduduk Musiman</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
        </div>
      </form>
    </div>
  );
}
