import { z } from "zod";

export const googleLoginSchema = z.object({
  body: z.object({
    token: z.string({
      message: "Token is required",
    }).min(1, "Token cannot be empty"),
  }),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>["body"];
