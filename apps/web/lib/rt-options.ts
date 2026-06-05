export const RT_OPTIONS = ["01", "02", "03", "04"] as const;

export type RtOption = (typeof RT_OPTIONS)[number];
