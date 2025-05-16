import { z } from "zod";

export const updateIdeaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, { message: "Title must be at least 10 characters long." }),
  description: z
    .string()
    .trim()
    .min(30, { message: "Description must be at least 30 characters long." }),
  status: z.enum(["active", "paused", "draft", "completed", "archived"]),
  stage: z.enum(["ideation", "validation", "mvp"]),
  targetAudience: z.string().trim().min(10, {
    message: "Target Audience must be at least 10 characters long.",
  }),
  targetSignups: z.coerce
    .number()
    .min(1, { message: "Target Signups must be at least 1." })
    .max(1000000, { message: "Target Signups must be at most 1,000,000." }),
  imageUrl: z.string().optional(),
});

export const updateMVPSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(10, { message: "Headline must be at least 10 characters long." }),
  subheadline: z
    .string()
    .trim()
    .min(10, { message: "Subheadline must be at least 10 characters long." }),
  ctaText: z
    .string()
    .trim()
    .min(10, { message: "CTA Text must be at least 10 characters long." }),
  ctaButtonText: z
    .string()
    .trim()
    .min(10, { message: "CTA Button must be at least 5 characters long." }),
});

export type UpdateMVPSchema = z.infer<typeof updateMVPSchema>;

export type UpdateIdeaFormValues = z.infer<typeof updateIdeaSchema>;
