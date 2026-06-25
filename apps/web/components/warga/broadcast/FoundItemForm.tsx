'use client';

import { useState } from 'react';
import SlideUpSheet from '@/components/warga/SlideUpSheet';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/warga/FormInput';
import FormTextarea from '@/components/warga/FormTextarea';
import FormDatePicker from '@/components/warga/FormDatePicker';
import FormFileUpload from '@/components/warga/FormFileUpload';
import { BroadcastItem } from '@/lib/dummy-broadcast';
import { useToast } from '@/components/ui/use-toast';

interface FoundItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: BroadcastItem | null;
  onSubmit: (broadcastId: string) => void;
}

export default function FoundItemForm({ isOpen, onClose, broadcast, onSubmit }: FoundItemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [finderName, setFinderName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [condition, setCondition] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Ambil hanya angka
    let digits = val.replace(/\D/g, '');
    
    // Jika input kosong atau user menghapus semua angka setelah +62
    if (digits === '' || digits === '62') {
      setPhone('');
      return;
    }

    // Hilangkan awalan 62 atau 0 agar tidak dobel
    if (digits.startsWith('62')) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    // Jika setelah di-trim ternyata kosong, reset
    if (digits.length === 0) {
      setPhone('');
      return;
    }

    // Pecah angka setiap 4 digit
    const chunks = [];
    for (let i = 0; i < digits.length; i += 4) {
      chunks.push(digits.substring(i, i + 4));
    }
    
    setPhone('+62-' + chunks.join('-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finderName || !phone || !location || !date || !condition) {
      toast({
        title: 'Error',
        description: 'Mohon lengkapi form yang wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    if (!broadcast) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);

    toast({
      title: 'Laporan Berhasil Dikirim',
      description: 'Terima kasih! Laporan Anda telah diteruskan ke Admin RW untuk diverifikasi.',
      variant: 'success',
    });

    // Reset form
    setFinderName('');
    setPhone('');
    setLocation('');
    setDate('');
    setTime('');
    setCondition('');
    setPhoto(null);

    onSubmit(broadcast.id);
  };

  return (
    <SlideUpSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Laporan Penemuan Barang"
      deskripsi={`Form pelaporan untuk barang: ${broadcast?.itemName}`}
    >
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
        <FormInput
          label="Nama Penemu"
          id="finderName"
          placeholder="Masukkan nama lengkap Anda"
          required
          value={finderName}
          onChange={(e) => setFinderName(e.target.value)}
        />
        
        <FormInput
          label="No. Telepon / WhatsApp"
          id="phone"
          type="tel"
          placeholder="+62-8xxx-xxxx-xxxx"
          required
          value={phone}
          onChange={handlePhoneChange}
        />

        <FormInput
          label="Lokasi Ditemukan"
          id="location"
          placeholder="Contoh: Di dekat pos satpam"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormDatePicker
            label="Tanggal"
            id="date"
            required
            value={date}
            onChange={(val) => setDate(val)}
          />
          <FormInput
            label="Waktu"
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <FormTextarea
          label="Kondisi Barang saat Ditemukan"
          id="condition"
          placeholder="Ceritakan secara singkat bagaimana kondisi barang tersebut..."
          required
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />

        <FormFileUpload
          label="Foto Barang (Opsional)"
          id="photo"
          description="Upload foto barang yang Anda temukan (Maks. 5MB)"
          onFileSelect={(file) => setPhoto(file || null)}
        />

        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
          <p className="text-xs text-blue-800 leading-relaxed text-center">
            Informasi yang Anda berikan akan dikirimkan ke Admin RW untuk dilakukan verifikasi lebih lanjut dengan pelapor.
          </p>
        </div>

        <Button 
          type="submit" 
          className="mt-2 w-full rounded-full shadow-sm" 
          size="lg"
          disabled={loading}
        >
          {loading ? 'Mengirim Laporan...' : 'Kirim Laporan Penemuan'}
        </Button>
      </form>
    </SlideUpSheet>
  );
}
