import { z } from "zod";

import { createApiSuccessSchema, paginationQuerySchema, rtCodeSchema } from "./common";

export const dashboardSummarySchema = z.object({
  stats: z.object({
    totalWarga: z.number().int().min(0),
    totalKK: z.number().int().min(0),
    totalMutasi: z.number().int().min(0),
    pendingRequests: z.number().int().min(0),
    deltaWarga: z.number().int().optional(),
    deltaKK: z.number().int().optional(),
    deltaMutasi: z.number().int().optional(),
  }),
  latestActivities: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string(),
      time: z.string(),
      action: z.string().optional(),
      entityType: z.string().optional(),
    }),
  ),
  notificationBadges: z.object({
    pendingVerifications: z.number().int().min(0),
    pendingRequests: z.number().int().min(0),
    pendingMutations: z.number().int().min(0),
    pendingAspirations: z.number().int().min(0),
    pendingBarangHilang: z.number().int().min(0),
  }),
});

export const rtBreakdownItemSchema = z.object({
  rt: z.string(),
  rw: z.string(),
  kk: z.number().int().min(0),
  warga: z.number().int().min(0),
  mutasi: z.number().int().min(0),
  produktif: z.number().int().min(0),
});

export const reportDemographicsSchema = z.object({
  totalCitizens: z.number().int().min(0),
  ageGroups: z.array(
    z.object({
      label: z.enum(["0-12", "13-17", "18-35", "36-59", "60+"]),
      value: z.number().int().min(0),
    }),
  ),
  gender: z.object({
    male: z.number().int().min(0),
    female: z.number().int().min(0),
  }),
});

export const reportDistributionItemSchema = z.object({
  label: z.string(),
  value: z.number().int().min(0),
  share: z.number().min(0).max(100),
});

export const reportInfographicSchema = z.object({
  totalCitizens: z.number().int().min(0),
  productiveAge: z.number().int().min(0),
  children: z.number().int().min(0),
  seniors: z.number().int().min(0),
  occupation: z.array(reportDistributionItemSchema),
  education: z.array(reportDistributionItemSchema),
  religion: z.array(reportDistributionItemSchema),
  maritalStatus: z.array(reportDistributionItemSchema),
  bloodType: z.array(reportDistributionItemSchema),
  residentStatus: z.array(reportDistributionItemSchema),
});

export const reportFilterSchema = z.object({
  tahun: z.coerce.number().int().min(2000).max(3000).optional(),
  bulan: z.coerce.number().int().min(1).max(12).optional(),
  rt: rtCodeSchema.optional(),
});

export const reportCitizenDrilldownQuerySchema = paginationQuerySchema.merge(reportFilterSchema).extend({
  q: z.string().trim().optional(),
});

export const reportSummaryResponseSchema = createApiSuccessSchema(dashboardSummarySchema);
export const rtBreakdownResponseSchema = createApiSuccessSchema(z.array(rtBreakdownItemSchema));
export const reportDemographicsResponseSchema = createApiSuccessSchema(reportDemographicsSchema);
export const reportInfographicResponseSchema = createApiSuccessSchema(reportInfographicSchema);
