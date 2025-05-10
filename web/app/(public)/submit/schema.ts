import { z } from "zod";

export const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, { message: "Title must be at least 10 characters long." }),
  description: z
    .string()
    .trim()
    .min(30, { message: "Description must be at least 30 characters long." }),
  targetAudience: z
    .string()
    .trim()
    .min(8, { message: "Target audience must be at least 8 characters long." }),
  cta: z.string().trim().optional(),
});
