'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  CheckCircle,
  CalendarBlank,
  Users,
  MapPin,
  ClipboardText,
  Money,
} from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { platformFetch } from '@/lib/api/platform';
import { useActionToast } from '@/lib/use-action-toast';

export default function AdminBansosTambahPage() {
  const router = useRouter();
  const { runWithToast } = useActionToast();
  
  const [formData, setFormData] = useState({
    title: '',
    assistanceType: 'PKH',
    description: '',
    startDate: '',
    endDate: '',
    fundingSource: '',
  });

  const [allowedRtScope, setAllowedRtScope] = useState<string[]>(['*']);
  const [generalRequirements, setGeneralRequirements] = useState<string[]>(['ACTIVE_CITIZEN', 'TIER_3']);

  const handleRtToggle = (rt: string) => {
    if (rt === '*') {
      setAllowedRtScope(allowedRtScope.includes('*') ? [] : ['*']);
    } else {
      const newScope = allowedRtScope.includes('*') ? [rt] : 
                       allowedRtScope.includes(rt) ? allowedRtScope.filter(r => r !== rt) : [...allowedRtScope, rt];
      setAllowedRtScope(newScope);
    }
  };

  const handleReqToggle = (req: string) => {
    if (req === 'ACTIVE_CITIZEN' || req === 'TIER_3') return; // Cannot toggle default strict requirements
    setGeneralRequirements(
      generalRequirements.includes(req) 
        ? generalRequirements.filter(r => r !== req) 
        : [...generalRequirements, req]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) return;

    try {
      await runWithToast(
        () => platformFetch('/admin/bansos', { // Uses the POST route to create program
          method: 'POST',
          body: JSON.stringify({
            title: formData.title,
            assistanceType: formData.assistanceType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            fundingSource: formData.fundingSource || formData.assistanceType,
            generalRequirements,
            allowedRtScope,
          })
        }),
        { loading: 'Menyimpan program...', success: 'Program Bansos berhasil dibuat!', error: 'Gagal membuat program' }
      );
      router.push('/admin/bansos');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program Bansos Baru</h1>
          <p className="text-sm text-slate-500 mt-1">Buat program bantuan sosial baru untuk warga RW 025</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <ClipboardText className="w-6 h-6 text-primary" weight="duotone" />
            <h2 className="text-lg font-bold text-slate-800">Informasi Dasar</h2>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Nama Program</Label>
              <Input 
                placeholder="Contoh: PKH Juni 2025" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Jenis Bantuan</Label>
              <Select value={formData.assistanceType} onValueChange={v => setFormData({...formData, assistanceType: v})}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKH">PKH (Program Keluarga Harapan)</SelectItem>
                  <SelectItem value="BPNT">BPNT (Bantuan Pangan Non Tunai)</SelectItem>
                  <SelectItem value="BST">BST (Bantuan Sosial Tunai)</SelectItem>
                  <SelectItem value="BLT_DD">BLT Dana Desa</SelectItem>
                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Deskripsi Singkat</Label>
              <Textarea 
                placeholder="Penjelasan singkat mengenai program ini untuk dibaca warga..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                rows={3} 
                className="rounded-xl border-slate-200 resize-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <CalendarBlank className="w-6 h-6 text-primary" weight="duotone" />
            <h2 className="text-lg font-bold text-slate-800">Periode & Kuota</h2>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Tanggal Mulai Pendaftaran</Label>
              <Input 
                type="date" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
                required 
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Tanggal Berakhir</Label>
              <Input 
                type="date" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
                required 
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Kuota Penerima (Opsional)</Label>
              <Input 
                type="number" 
                placeholder="Kosongkan jika tak terbatas" 
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Nilai Bantuan (Opsional)</Label>
              <Input 
                placeholder="Rp 600.000" 
                className="rounded-xl border-slate-200"
                value={formData.fundingSource} 
                onChange={e => setFormData({...formData, fundingSource: e.target.value})} 
              />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <MapPin className="w-6 h-6 text-primary" weight="duotone" />
              <h2 className="text-lg font-bold text-slate-800">Cakupan RT</h2>
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <Checkbox checked={allowedRtScope.includes('*')} onCheckedChange={() => handleRtToggle('*')} />
                <span className="font-semibold text-slate-700">Semua RT (RW 025)</span>
              </Label>
              <div className="grid grid-cols-2 gap-3 pl-2">
                {['01', '02', '03'].map(rt => (
                  <Label key={rt} className={`flex items-center gap-3 p-3 rounded-xl border ${allowedRtScope.includes('*') ? 'opacity-50 pointer-events-none' : ''} ${allowedRtScope.includes(rt) ? 'border-primary bg-blue-50/50' : 'border-slate-200'} cursor-pointer hover:bg-slate-50`}>
                    <Checkbox 
                      checked={allowedRtScope.includes(rt) || allowedRtScope.includes('*')} 
                      onCheckedChange={() => handleRtToggle(rt)} 
                      disabled={allowedRtScope.includes('*')}
                    />
                    <span className="font-medium text-slate-700">RT {rt}</span>
                  </Label>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Users className="w-6 h-6 text-primary" weight="duotone" />
              <h2 className="text-lg font-bold text-slate-800">Persyaratan Warga</h2>
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/50 cursor-not-allowed">
                <Checkbox checked disabled />
                <div className="flex flex-col">
                  <span className="font-semibold text-blue-800">Warga Aktif Terdaftar</span>
                  <span className="text-sm text-blue-600">Otomatis terverifikasi dari data warga</span>
                </div>
              </Label>
              <Label className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/50 cursor-not-allowed">
                <Checkbox checked disabled />
                <div className="flex flex-col">
                  <span className="font-semibold text-blue-800">Minimal Tier 3 (Terverifikasi)</span>
                  <span className="text-sm text-blue-600">Wajib sudah melengkapi profil & KK</span>
                </div>
              </Label>

              <Label className={`flex items-center gap-3 p-3 rounded-xl border ${generalRequirements.includes('BALITA') ? 'border-primary bg-blue-50/50' : 'border-slate-200'} cursor-pointer hover:bg-slate-50`}>
                <Checkbox checked={generalRequirements.includes('BALITA')} onCheckedChange={() => handleReqToggle('BALITA')} />
                <span className="font-medium text-slate-700">Memiliki Anggota Balita (0-5 thn)</span>
              </Label>

              <Label className={`flex items-center gap-3 p-3 rounded-xl border ${generalRequirements.includes('LANSIA') ? 'border-primary bg-blue-50/50' : 'border-slate-200'} cursor-pointer hover:bg-slate-50`}>
                <Checkbox checked={generalRequirements.includes('LANSIA')} onCheckedChange={() => handleReqToggle('LANSIA')} />
                <span className="font-medium text-slate-700">Memiliki Anggota Lansia (60+ thn)</span>
              </Label>
              
              <Label className={`flex items-center gap-3 p-3 rounded-xl border ${generalRequirements.includes('SKTM') ? 'border-primary bg-blue-50/50' : 'border-slate-200'} cursor-pointer hover:bg-slate-50`}>
                <Checkbox checked={generalRequirements.includes('SKTM')} onCheckedChange={() => handleReqToggle('SKTM')} />
                <span className="font-medium text-slate-700">Wajib Melampirkan SKTM</span>
              </Label>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl px-6 h-12">
            Batal
          </Button>
          <Button type="submit" className="rounded-xl px-8 h-12 bg-primary hover:bg-primary/90 shadow-md">
            <CheckCircle className="w-5 h-5 mr-2" />
            Publikasikan Program
          </Button>
        </div>
      </form>
    </div>
  );
}
