import { z } from "zod";

export const laporanFormSchema = z.object({
  itemName: z.string().min(3, "Nama barang minimal 3 karakter").max(100),
  category: z.enum(["wallet_bag", "vehicle", "electronic", "document", "jewelry", "pet", "other"]),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000),
  estimatedValue: z.string().max(50).optional(),
  color: z.string().max(50).optional(),

  incidentDate: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(now.getDate() - 90);
    return date <= now && date >= minDate;
  }, "Tanggal tidak valid. Maksimal 90 hari yang lalu."),
  incidentTime: z.string().optional(),
  location: z.string().min(5, "Lokasi minimal 5 karakter").max(200),
  chronicle: z.string().min(20, "Kronologi minimal 20 karakter").max(2000),

  notes: z.string().max(300).optional(),
});

export type LaporanFormValues = z.infer<typeof laporanFormSchema>;
