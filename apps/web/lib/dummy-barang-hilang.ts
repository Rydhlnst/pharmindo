import type { LaporanBarangHilang, StatsResponse } from '@/types/barang-hilang';

export const DUMMY_BARANG_HILANG: LaporanBarangHilang[] = [
  {
    id: 'b-001',
    ticketNumber: 'BH-2025-0047',
    status: 'pending_verification',
    priority: 'medium',
    createdAt: new Date('2025-06-02T08:15:00').toISOString(),
    updatedAt: new Date('2025-06-02T08:15:00').toISOString(),
    handledBy: null,
    adminNotes: null,
    adminReply: null,
    verificationChecklist: {
      identityComplete: true,
      descriptionAdequate: false,
      photoAttached: true,
      chronicleClear: true,
      whatsappVerified: false,
    },
    reporter: {
      id: 'usr-1',
      name: 'Ahmad Faisal',
      phone: '081234567890',
      whatsapp: '081234567890',
      alternativeContact: null,
      rt: '02',
      rw: '025',
      address: 'Jl. Merdeka No. 12, RT 02/025',
    },
    item: {
      name: 'Dompet Kulit Pria',
      category: 'Dompet/Tas',
      description: 'Dompet kulit warna coklat gelap merk Braun Buffel. Berisi KTP, SIM C, dan beberapa lembar uang ratusan ribu.',
      color: 'Coklat',
      estimatedValue: 500000,
    },
    incident: {
      date: '2025-06-02',
      time: '07:30',
      location: 'Sekitar warung Bu Yani (RT 02)',
      chronicle: 'Sehabis beli sarapan di warung Bu Yani, saya baru sadar dompet tidak ada di saku belakang celana. Kemungkinan jatuh di sepanjang jalan gang.',
    },
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400',
        originalFilename: 'contoh-dompet.jpg',
      }
    ],
    notes: 'Tolong dibantu ya Pak/Bu, KTP-nya sangat penting untuk urusan kerjaan minggu ini.',
  },
  {
    id: 'b-002',
    ticketNumber: 'BH-2025-0046',
    status: 'processing',
    priority: 'high',
    createdAt: new Date('2025-06-01T14:20:00').toISOString(),
    updatedAt: new Date('2025-06-01T15:00:00').toISOString(),
    handledBy: 'Admin RW',
    adminNotes: 'Sudah di-broadcast ke RT 01. Nomor pelapor aktif.',
    adminReply: 'Laporan sedang kami proses dan sudah dibroadcast ke warga RT 01.',
    verificationChecklist: {
      identityComplete: true,
      descriptionAdequate: true,
      photoAttached: true,
      chronicleClear: true,
      whatsappVerified: true,
    },
    reporter: {
      id: 'usr-2',
      name: 'Siti Rahma',
      phone: '085711223344',
      whatsapp: '085711223344',
      alternativeContact: '022665544',
      rt: '01',
      rw: '025',
      address: 'Blok A3 No. 4, RT 01/025',
    },
    item: {
      name: 'Motor Honda Beat',
      category: 'Kendaraan',
      description: 'Motor Honda Beat warna putih biru, Nopol D 1234 ABC. Ada stiker Doraemon di sepatbor depan.',
      color: 'Putih Biru',
      estimatedValue: 12000000,
    },
    incident: {
      date: '2025-06-01',
      time: '13:00',
      location: 'Parkiran Indomaret depan komplek',
      chronicle: 'Saya parkir sebentar untuk beli pulsa, kunci lupa dicabut. Saat keluar motor sudah tidak ada.',
    },
    photos: [],
    notes: 'Sudah lapor juga ke Polsek terdekat.',
  },
  {
    id: 'b-003',
    ticketNumber: 'BH-2025-0045',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date('2025-05-30T09:10:00').toISOString(),
    updatedAt: new Date('2025-05-31T10:00:00').toISOString(),
    handledBy: 'Admin RW',
    adminNotes: 'Ditemukan oleh satpam komplek, sudah diserahkan kembali.',
    adminReply: 'Syukurlah barang sudah ditemukan. Tiket ditutup.',
    verificationChecklist: {
      identityComplete: true,
      descriptionAdequate: true,
      photoAttached: false,
      chronicleClear: true,
      whatsappVerified: true,
    },
    reporter: {
      id: 'usr-3',
      name: 'Budi Santoso',
      phone: '081998877665',
      whatsapp: '081998877665',
      alternativeContact: null,
      rt: '03',
      rw: '025',
      address: 'Jl. Melati No. 5, RT 03/025',
    },
    item: {
      name: 'HP Samsung Galaxy',
      category: 'Elektronik',
      description: 'Samsung Galaxy A52 casing hitam polos, wallpaper gambar anak kecil.',
      color: 'Hitam',
      estimatedValue: 3000000,
    },
    incident: {
      date: '2025-05-30',
      time: '08:45',
      location: 'Taman Komplek',
      chronicle: 'Anak saya main di taman bawa HP, waktu pulang lupa HPnya tertinggal di bangku taman.',
    },
    photos: [],
    notes: null,
  }
];

export const DUMMY_STATS: StatsResponse = {
  total: 47,
  byStatus: {
    pending_verification: 8,
    in_verification: 3,
    processing: 12,
    resolved: 20,
    rejected: 2,
    archived: 2,
  },
  byRT: {
    rt01: 15,
    rt02: 20,
    rt03: 12,
  },
  byMonth: [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 7 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 12 },
    { month: 'May', count: 10 },
    { month: 'Jun', count: 5 },
  ],
};

import type { AuditLogItem } from '@/types/barang-hilang';

export const DUMMY_LAPORAN_SAYA: LaporanBarangHilang[] = [
  {
    ...DUMMY_BARANG_HILANG[0], // pending_verification
    id: "w-1",
    ticketNumber: "BH-2025-0047",
    status: "processing",
    adminReply: "Laporan telah diverifikasi dan broadcast ke seluruh warga RT 1–3.",
  },
  {
    ...DUMMY_BARANG_HILANG[1], // processing -> rejected
    id: "w-2",
    ticketNumber: "BH-2025-0043",
    status: "rejected",
    adminReply: "Deskripsi barang kurang lengkap. Silakan ajukan ulang.",
  },
  {
    ...DUMMY_BARANG_HILANG[2], // resolved
    id: "w-3",
    ticketNumber: "BH-2025-0038",
    status: "resolved",
  },
];

// Dummy audit log untuk halaman detail
export const DUMMY_AUDIT_LOG: AuditLogItem[] = [
  { createdAt: "2025-06-02T14:32:00Z", description: "Laporan dikirim" },
  { createdAt: "2025-06-02T15:10:00Z", description: "Sedang diverifikasi" },
  { createdAt: "2025-06-02T16:45:00Z", description: "Broadcast dikirim ke RT 1–3" },
];
