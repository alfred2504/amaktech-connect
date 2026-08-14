import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters.")
    .max(200),

  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens."
    ),

  description: z
    .string()
    .max(5000)
    .optional(),

  sku: z
    .string()
    .min(2)
    .max(100),

  price: z
    .number()
    .positive("Price must be greater than zero."),

  compareAtPrice: z
    .number()
    .positive()
    .optional()
    .nullable(),

  categoryId: z
    .string()
    .uuid(),

  brandId: z
    .string()
    .uuid()
    .optional()
    .nullable(),

  isActive: z
    .boolean()
    .default(true),
});

export type ProductInput =
  z.infer<typeof productSchema>;