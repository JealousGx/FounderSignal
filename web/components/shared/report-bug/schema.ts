import { z } from "zod";

export const bugReportSchema = z.object({
  description: z
    .string()
    .min(10, "Please provide a description of at least 10 characters.")
    .max(1000, "The description cannot exceed 1000 characters."),
  stepsToReproduce: z
    .string()
    .min(10, "Please provide steps of at least 10 characters.")
    .max(2000, "The steps cannot exceed 2000 characters."),
  pageUrl: z.string().url(),
});
