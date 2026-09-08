import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters.")
    .max(100),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens."
    ),

  description: z
    .string()
    .max(500)
    .optional(),

  logo: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;