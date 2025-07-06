import { z } from "zod";

export const reportSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason of at least 10 characters.")
    .max(500, "The reason cannot exceed 500 characters."),
  contentId: z.string(),
  contentType: z.enum(["idea", "comment"]),
  contentUrl: z.string().url(),
});
