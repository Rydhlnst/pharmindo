export interface BroadcastItem {
  id: string;
  ticketNumber: string;
  itemName: string;
  itemDescription: string;
  itemColor: string;
  category: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  reporterRT: string;
  targetRTs: string[];
  broadcastMessage: string;
  broadcastedAt: string;
  status: 'active' | 'found' | 'expired';
  isRead: boolean;
  photos: { url: string }[];
}

export const DUMMY_BROADCASTS: BroadcastItem[] = [
  {
    id: 'bc-1',
    ticketNumber: 'BH-2025-0046',
    itemName: 'Motor Honda Beat',
    itemDescription: 'Motor Honda Beat warna putih biru, Nopol D 1234 ABC. Ada stiker Doraemon di sepatbor depan.',
    itemColor: 'Putih Biru',
    category: 'Kendaraan',
    incidentDate: '2026-06-25',
    incidentTime: '13:00',
    location: 'Parkiran Indomaret depan komplek',
    reporterRT: '01',
    targetRTs: ['01', '02', '03'],
    broadcastMessage: '📢 Info Kehilangan Kendaraan · RW 025\n\nWarga RT 01 melaporkan kehilangan Motor Honda Beat pada tanggal 25 Juni 2026 di sekitar Parkiran Indomaret.\n\nCiri-ciri: Nopol D 1234 ABC. Ada stiker Doraemon di sepatbor depan.\n\nBagi warga yang melihat atau menemukan, mohon segera melapor melalui tombol "Saya Menemukan Barang Ini" di bawah.',
    broadcastedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: 'active',
    isRead: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'bc-2',
    ticketNumber: 'BH-2025-0047',
    itemName: 'Dompet Kulit Pria',
    itemDescription: 'Dompet kulit warna coklat gelap merk Braun Buffel. Berisi KTP, SIM C atas nama Ahmad.',
    itemColor: 'Coklat',
    category: 'Dompet/Tas',
    incidentDate: '2026-06-24',
    incidentTime: '07:30',
    location: 'Sekitar warung Bu Yani (RT 02)',
    reporterRT: '02',
    targetRTs: ['01', '02', '03'],
    broadcastMessage: '📢 Info Kehilangan Barang · RW 025\n\nWarga RT 02 melaporkan kehilangan Dompet Kulit Pria pada tanggal 24 Juni 2026 di Sekitar warung Bu Yani.\n\nCiri-ciri: Warna coklat gelap merk Braun Buffel. Berisi KTP, SIM C atas nama Ahmad.\n\nBagi warga yang melihat atau menemukan dompet tersebut, mohon segera menginformasikannya ke pengurus RW atau klik tombol di bawah.',
    broadcastedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'active',
    isRead: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];
