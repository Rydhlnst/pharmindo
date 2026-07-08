export type BansosProgram = {
  id: string;
  title: string;
  assistanceType: string;
  startDate: string;
  endDate: string;
  fundingSource?: string;
  generalRequirements: string[];
  allowedRtScope: string[];
  description?: string;
};

export type BansosApplication = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  payload: {
    programId: string;
    applicantName: string;
    incomeAmount?: string;
    notes?: string;
    attachments?: Array<{ url: string; category?: string; fileName?: string }>;
    noKkUnik?: string;
    tier?: number;
    membersCount?: number;
  };
};

export const DUMMY_PROGRAMS: BansosProgram[] = [
  {
    id: "prog-001",
    title: "PKH Khusus Balita & Ibu Hamil - 2025",
    assistanceType: "PKH",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    fundingSource: "Kemensos (Rp 1.500.000)",
    generalRequirements: ["ACTIVE_CITIZEN", "TIER_3", "BALITA"],
    allowedRtScope: ["*"],
    description: "Program Bantuan Harapan khusus untuk keluarga yang memiliki balita atau ibu hamil untuk mendukung peningkatan gizi."
  },
  {
    id: "prog-002",
    title: "Bantuan Pangan Non Tunai (BPNT)",
    assistanceType: "BPNT",
    startDate: "2025-06-10",
    endDate: "2025-06-25",
    fundingSource: "Sembako (Rp 600.000)",
    generalRequirements: ["ACTIVE_CITIZEN", "TIER_3", "SKTM"],
    allowedRtScope: ["01", "02"],
    description: "Bantuan sembako bulanan untuk warga RT 01 dan 02 yang membutuhkan bantuan logistik pangan dasar."
  },
  {
    id: "prog-003",
    title: "Bantuan Lansia Sejahtera",
    assistanceType: "BST",
    startDate: "2025-06-15",
    endDate: "2025-07-15",
    fundingSource: "Kas RW (Rp 300.000)",
    generalRequirements: ["ACTIVE_CITIZEN", "TIER_3", "LANSIA"],
    allowedRtScope: ["*"],
    description: "Bantuan tunai dari kas mandiri RW khusus diperuntukkan bagi warga lanjut usia di atas 60 tahun."
  }
];

export const DUMMY_APPLICATIONS: BansosApplication[] = [
  {
    id: "app-101",
    status: "PENDING",
    rejectionReason: null,
    createdAt: "2025-06-12T10:30:00Z",
    payload: {
      programId: "prog-001",
      applicantName: "Budi Santoso",
      notes: "Anak saya balita kurang gizi dan butuh susu tambahan.",
      noKkUnik: "RT01-KK-015",
      tier: 3,
      attachments: [
        { category: "KTP", fileName: "ktp-budi.jpg", url: "#" },
        { category: "KK", fileName: "kk-budi.pdf", url: "#" }
      ]
    }
  },
  {
    id: "app-102",
    status: "APPROVED",
    rejectionReason: null,
    createdAt: "2025-06-11T09:15:00Z",
    payload: {
      programId: "prog-003",
      applicantName: "Neneng Wulandari",
      notes: "Saya sudah janda lansia hidup sendiri.",
      noKkUnik: "RT02-KK-042",
      tier: 3,
      attachments: [
        { category: "KTP", fileName: "ktp-neneng.jpg", url: "#" },
        { category: "KK", fileName: "kk-neneng.pdf", url: "#" }
      ]
    }
  },
  {
    id: "app-103",
    status: "REJECTED",
    rejectionReason: "Foto KK kabur dan tidak terbaca. Harap foto ulang di tempat yang terang.",
    createdAt: "2025-06-10T14:20:00Z",
    payload: {
      programId: "prog-002",
      applicantName: "Ahmad Jaelani",
      notes: "Butuh beras karena di-PHK bulan lalu.",
      noKkUnik: "RT03-KK-088",
      tier: 3,
      attachments: [
        { category: "KTP", fileName: "ktp-ahmad.jpg", url: "#" },
        { category: "SKTM", fileName: "sktm.jpg", url: "#" }
      ]
    }
  }
];
