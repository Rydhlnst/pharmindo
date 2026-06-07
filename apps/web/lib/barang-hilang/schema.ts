import { z } from "zod";

export const laporanFormSchema = z.object({
  // Identitas
  name: z.string().min(3).max(100).regex(/^[a-zA-Z\s]+$/),
  phone: z.string().regex(/^(08|\+62)\d{8,11}$/),
  rt: z.enum(["rt01", "rt02", "rt03"]),
  address: z.string().min(10).max(300),

  // Barang
  itemName: z.string().min(3).max(100),
  category: z.enum(["wallet_bag", "vehicle", "electronic", "document", "jewelry", "pet", "other"]),
  description: z.string().min(20).max(500),
  estimatedValue: z.string().max(50).optional(),
  color: z.string().max(50).optional(),

  // Kronologi
  incidentDate: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(now.getDate() - 90);
    return date <= now && date >= minDate;
  }, "Tanggal tidak valid. Maksimal 90 hari yang lalu."),
  incidentTime: z.string().optional(),
  location: z.string().min(5).max(200),
  chronicle: z.string().min(30).max(1000),

  // Kontak
  whatsapp: z.string().regex(/^(08|\+62)\d{8,11}$/).optional().or(z.literal("")),
  alternativeContact: z.string().max(100).optional(),
  notes: z.string().max(300).optional(),
});

export type LaporanFormValues = z.infer<typeof laporanFormSchema>;
