export type ReportStatus =
  | 'pending_verification'
  | 'in_verification'
  | 'processing'
  | 'resolved'
  | 'rejected'
  | 'archived';

export type ReportPriority = 'low' | 'medium' | 'high';

export interface VerificationChecklist {
  identityComplete: boolean;
  descriptionAdequate: boolean;
  photoAttached: boolean;
  chronicleClear: boolean;
  whatsappVerified: boolean;
}

export interface Attachment {
  url: string;
  thumbnailUrl?: string;
  originalFilename: string;
}

export interface LaporanBarangHilang {
  id: string;
  ticketNumber: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
  updatedAt: string;
  handledBy: string | null;
  adminNotes: string | null;
  adminReply: string | null;
  verificationChecklist: VerificationChecklist;
  
  reporter: {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
    alternativeContact: string | null;
    rt: string;
    rw: string;
    address: string;
  };
  
  item: {
    name: string;
    category: string;
    description: string;
    color: string | null;
    estimatedValue: number | null;
  };
  
  incident: {
    date: string;
    time: string | null;
    location: string;
    chronicle: string;
  };
  
  photos: Attachment[];
  notes: string | null; // Catatan tambahan warga
}

export interface BroadcastPayload {
  targetRTs: Array<'rt01' | 'rt02' | 'rt03'>;
  channels: Array<'inapp' | 'whatsapp' | 'email'>;
  customMessage?: string;
}

export interface StatsResponse {
  total: number;
  byStatus: {
    pending_verification: number;
    in_verification: number;
    processing: number;
    resolved: number;
    rejected: number;
    archived: number;
  };
  byRT: {
    rt01: number;
    rt02: number;
    rt03: number;
  };
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

export interface BroadcastConfig {
  channels: {
    inapp: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  targetRTs: {
    rt01: boolean;
    rt02: boolean;
    rt03: boolean;
  };
}

// ==========================================
// Tambahan type khusus sisi warga
// ==========================================

export type KategoriBarang = "wallet_bag" | "vehicle" | "electronic" | "document" | "jewelry" | "pet" | "other";
export type TargetRT = "rt01" | "rt02" | "rt03";

// Payload submit laporan baru
export interface SubmitLaporanPayload {
  // Identitas
  name: string;
  phone: string;
  rt: TargetRT;
  address: string;

  // Barang
  itemName: string;
  category: KategoriBarang;
  description: string;
  estimatedValue?: string;
  color?: string;

  // Kronologi
  incidentDate: string;       // YYYY-MM-DD
  incidentTime?: string;      // HH:mm
  location: string;
  chronicle: string;

  // Foto
  photos?: File[];            // maks 3 file, 5 MB/file

  // Kontak
  whatsapp?: string;
  alternativeContact?: string;
  notes?: string;
}

// Response setelah submit berhasil (201)
export interface SubmitLaporanResponse {
  success: true;
  data: {
    id: string;
    ticketNumber: string;     // "BH-2025-0047"
    status: "pending_verification";
    createdAt: string;
    itemName: string;
    category: KategoriBarang;
  };
}

// Response error validasi (422)
export interface ValidationErrorResponse {
  success: false;
  errors: {
    field: string;
    message: string;
  }[];
}

// Notifikasi warga
export interface NotifikasiWarga {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  relatedTicket?: string;
}

// Audit log (riwayat status)
export interface AuditLogItem {
  createdAt: string;
  description: string;
}
