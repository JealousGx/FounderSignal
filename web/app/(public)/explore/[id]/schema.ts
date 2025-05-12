import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export type ReplyFormValues = z.infer<typeof messageSchema>;
