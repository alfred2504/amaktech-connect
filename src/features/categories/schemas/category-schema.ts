import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(100),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens."
    ),

  description: z
    .string()
    .max(500)
    .optional(),

  image: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;