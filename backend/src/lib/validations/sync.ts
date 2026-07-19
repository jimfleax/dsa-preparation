import { z } from "zod";

export const trackSubmissionsSchema = z.object({
  body: z.object({
    submissions: z.array(
      z.object({
        titleSlug: z.string().min(1, "titleSlug is required"),
        title: z.string().min(1, "title is required"),
        timestamp: z.union([z.string(), z.number()]),
      }).passthrough()
    ).default([]),
    notrack: z.boolean().optional(),
  }),
});
