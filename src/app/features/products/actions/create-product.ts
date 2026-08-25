"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

import {
  productSchema,
  type ProductInput,
} from "../schemas/product-schema";

export async function createProduct(
  input: ProductInput
) {
  await requirePermission(
    PERMISSIONS.PRODUCT_CREATE
  );

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid product details.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existing =
    await prisma.product.findFirst({
      where: {
        OR: [
          { sku: data.sku },
          { slug: data.slug },
        ],
      },
    });

  if (existing) {
    return {
      success: false,
      error:
        "A product with this SKU or slug already exists.",
    };
  }

  const category =
    await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        deletedAt: null,
      },
    });

  if (!category) {
    return {
      success: false,
      error: "Selected category does not exist.",
    };
  }

  let brandId: string | null = null;

  if (data.brandId) {
    const brand =
      await prisma.brand.findFirst({
        where: {
          id: data.brandId,
          deletedAt: null,
        },
      });

    if (!brand) {
      return {
        success: false,
        error: "Selected brand does not exist.",
      };
    }

    brandId = brand.id;
  }

  const compareAtPrice =
    data.compareAtPrice === ""
      ? null
      : data.compareAtPrice ?? null;

  const product =
    await prisma.$transaction(
      async (tx) => {
        const created =
          await tx.product.create({
            data: {
              name: data.name,
              slug: data.slug,
              description:
                data.description || null,
              sku: data.sku,
              price: data.price,
              compareAtPrice,
              categoryId: data.categoryId,
              brandId,
              isActive: data.isActive,
            },
          });

        await tx.inventory.create({
          data: {
            productId: created.id,
            stock: 0,
            reserved: 0,
            lowStockThreshold: 5,
          },
        });

        return created;
      }
    );

  return {
    success: true,
    product,
  };
}