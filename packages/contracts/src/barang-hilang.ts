import { z } from "zod";

import { createApiSuccessSchema, paginationQuerySchema } from "./common";

export const barangHilangStatusOptions = [
  "pending_verification",
  "in_verification",
  "processing",
  "resolved",
  "rejected",
  "archived",
] as const;

export const barangHilangPriorityOptions = ["low", "medium", "high"] as const;

export const barangHilangStatusSchema = z.enum(barangHilangStatusOptions);
export const barangHilangPrioritySchema = z.enum(barangHilangPriorityOptions);

export const barangHilangPhotoSchema = z.object({
  url: z.string().min(1),
  originalFilename: z.string().min(1),
  thumbnailUrl: z.string().optional(),
});

export const barangHilangChecklistSchema = z.object({
  identityComplete: z.boolean(),
  descriptionAdequate: z.boolean(),
  photoAttached: z.boolean(),
  chronicleClear: z.boolean(),
  whatsappVerified: z.boolean(),
});

export const barangHilangSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  reporterId: z.string(),
  reporterName: z.string(),
  reporterEmail: z.string().nullable(),
  status: barangHilangStatusSchema,
  priority: barangHilangPrioritySchema,
  itemName: z.string(),
  category: z.string(),
  itemDescription: z.string(),
  color: z.string().nullable(),
  estimatedValue: z.number().nullable(),
  incidentDate: z.string(),
  incidentTime: z.string().nullable(),
  location: z.string(),
  chronicle: z.string(),
  photos: z.array(barangHilangPhotoSchema),
  verificationChecklist: barangHilangChecklistSchema.nullable(),
  handledBy: z.string().nullable(),
  handledByName: z.string().nullable(),
  adminNotes: z.string().nullable(),
  adminReply: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const barangHilangListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: barangHilangStatusSchema.optional(),
  priority: barangHilangPrioritySchema.optional(),
});

export const createBarangHilangSchema = z.object({
  itemName: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  itemDescription: z.string().trim().min(5).max(1000),
  color: z.string().trim().max(60).optional(),
  estimatedValue: z.number().int().min(0).optional(),
  incidentDate: z.string().date(),
  incidentTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  location: z.string().trim().min(2).max(255),
  chronicle: z.string().trim().min(5).max(2000),
  photos: z.array(barangHilangPhotoSchema).max(6).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateBarangHilangSchema = z.object({
  status: barangHilangStatusSchema.optional(),
  priority: barangHilangPrioritySchema.optional(),
  adminNotes: z.string().trim().max(1000).nullable().optional(),
  adminReply: z.string().trim().max(1000).nullable().optional(),
  verificationChecklist: barangHilangChecklistSchema.optional(),
  handledBy: z.string().nullable().optional(),
}).refine((v) => Object.keys(v).length > 0, "At least one field must be provided");

export const barangHilangStatsSchema = z.object({
  total: z.number().int().min(0),
  byStatus: z.record(barangHilangStatusSchema, z.number().int().min(0)),
});

export const barangHilangListResponseSchema = createApiSuccessSchema(z.array(barangHilangSchema));
export const barangHilangResponseSchema = createApiSuccessSchema(barangHilangSchema);
export const barangHilangStatsResponseSchema = createApiSuccessSchema(barangHilangStatsSchema);

export type BarangHilangDto = z.infer<typeof barangHilangSchema>;
export type BarangHilangStatus = z.infer<typeof barangHilangStatusSchema>;
export type BarangHilangPriority = z.infer<typeof barangHilangPrioritySchema>;
