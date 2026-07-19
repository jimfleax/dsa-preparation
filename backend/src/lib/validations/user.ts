import { z } from "zod";

export const updateUserSettingsSchema = z.object({
  body: z.object({
    leetcodeUsername: z.string().optional(),
  }),
});
