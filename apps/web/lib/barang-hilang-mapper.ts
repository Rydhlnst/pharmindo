import type { LaporanBarangHilang } from '@/types/barang-hilang';

export type BackendBarangHilang = {
  id: string;
  ticketNumber: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string | null;
  status: LaporanBarangHilang['status'];
  priority: LaporanBarangHilang['priority'];
  itemName: string;
  category: string;
  itemDescription: string;
  color: string | null;
  estimatedValue: number | null;
  incidentDate: string;
  incidentTime: string | null;
  location: string;
  chronicle: string;
  photos: Array<{ url: string; originalFilename: string; thumbnailUrl?: string }>;
  verificationChecklist: LaporanBarangHilang['verificationChecklist'] | null;
  handledBy: string | null;
  handledByName: string | null;
  adminNotes: string | null;
  adminReply: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapBackendBarangHilang(b: BackendBarangHilang): LaporanBarangHilang {
  return {
    id: b.id,
    ticketNumber: b.ticketNumber,
    status: b.status,
    priority: b.priority,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    handledBy: b.handledByName ?? b.handledBy ?? null,
    adminNotes: b.adminNotes,
    adminReply: b.adminReply,
    verificationChecklist: b.verificationChecklist ?? {
      identityComplete: false,
      descriptionAdequate: false,
      photoAttached: false,
      chronicleClear: false,
      whatsappVerified: false,
    },
    reporter: {
      id: b.reporterId,
      name: b.reporterName,
      phone: '',
      whatsapp: '',
      alternativeContact: null,
      rt: '',
      rw: '025',
      address: '',
    },
    item: {
      name: b.itemName,
      category: b.category,
      description: b.itemDescription,
      color: b.color,
      estimatedValue: b.estimatedValue,
    },
    incident: {
      date: b.incidentDate,
      time: b.incidentTime,
      location: b.location,
      chronicle: b.chronicle,
    },
    photos: b.photos ?? [],
    notes: b.notes,
  };
}
