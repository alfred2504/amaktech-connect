import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters.")
    .max(200),

  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only."
    ),

  description: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("")),

  sku: z
    .string()
    .min(2, "SKU is required.")
    .max(100),

  price: z.coerce
    .number()
    .positive("Price must be greater than zero."),

  compareAtPrice: z
    .union([
      z.coerce.number().positive(),
      z.literal(""),
    ])
    .optional(),

  categoryId: z
    .string()
    .uuid("Invalid category."),

  brandId: z
    .string()
    .uuid("Invalid brand.")
    .optional()
    .or(z.literal("")),

  isActive: z
    .boolean()
    .default(true),
});

export type ProductInput =
  z.infer<typeof productSchema>;