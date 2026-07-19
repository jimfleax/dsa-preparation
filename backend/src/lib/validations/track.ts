import { z } from "zod";

const trackProblemSchema = z.object({
  title: z.string().min(1, "Problem title is required"),
  titleSlug: z.string().min(1, "Problem titleSlug is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  url: z.string().url("Must be a valid URL"),
});

const trackPartSchema = z.object({
  title: z.string().min(1, "Part title is required"),
  description: z.string().optional(),
  problems: z.array(trackProblemSchema).default([]),
});

export const createTrackSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Track title is required"),
    description: z.string().min(1, "Track description is required"),
    problems: z.array(trackProblemSchema).default([]),
    parts: z.array(trackPartSchema).optional(),
  }),
});

export const updateTrackSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Track ID"),
  }),
  body: z.object({
    title: z.string().min(1, "Track title is required").optional(),
    description: z.string().min(1, "Track description is required").optional(),
    problems: z.array(trackProblemSchema).optional(),
    parts: z.array(trackPartSchema).optional(),
  }),
});

export const getTrackSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Track ID"),
  }),
});

export const listTracksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>["body"];
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>["body"];
