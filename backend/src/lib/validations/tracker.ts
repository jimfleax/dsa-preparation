import { z } from "zod";

export const scrapeTitleSchema = z.object({
  body: z.object({
    url: z.string().url("A valid LeetCode URL is required."),
  }),
});

export const addProblemSchema = z.object({
  body: z.object({
    url: z.string().url("A valid LeetCode URL is required."),
    reviewDurationDays: z.number().int().min(1).optional().nullable(),
  }),
});

export const updateProblemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid problem ID format."),
  }),
  body: z.object({
    url: z.string().url("A valid URL is required.").optional(),
    attemptCount: z.coerce
      .number()
      .int()
      .min(1, "Attempt count must be at least 1.")
      .optional(),
    reviewDurationDays: z.number().int().min(1).optional().nullable(),
    notes: z
      .string()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional()
      .nullable(),
  }),
});

export const revisitProblemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid problem ID format."),
  }),
  body: z.object({
    timestamp: z.union([z.number(), z.string()]).optional(),
    reviewDurationDays: z.number().int().min(1).optional().nullable(),
  }),
});

export const revisitProblemBySlugSchema = z.object({
  params: z.object({
    titleSlug: z.string().min(1, "titleSlug is required."),
  }),
  body: z.object({
    timestamp: z.union([z.number(), z.string()]).optional(),
    reviewDurationDays: z.number().int().min(1).optional().nullable(),
  }),
});

export const listProblemsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sort: z.enum(["title", "attempts", "date"]).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.union([z.string().regex(/^\d+$/), z.literal("all")]).optional(),
  }),
});

export const getLeetCodeCalendarSchema = z.object({
  params: z.object({
    username: z.string().min(1, "Username is required"),
  }),
  query: z.object({
    year: z.string().regex(/^\d{4}$/, "Invalid year").optional(),
  }),
});

export const toggleTrackProblemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid problem ID format."),
  }),
});

export const deleteProblemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid problem ID format."),
  }),
});
