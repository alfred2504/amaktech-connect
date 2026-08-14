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
    };
  }

  const data = parsed.data;

  const existing = await prisma.product.findFirst({
    where: {
      OR: [
        {
          sku: data.sku,
        },
        {
          slug: data.slug,
        },
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
    await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

  if (!category) {
    return {
      success: false,
      error: "Selected category does not exist.",
    };
  }

  if (data.brandId) {
    const brand =
      await prisma.brand.findUnique({
        where: {
          id: data.brandId,
        },
      });

    if (!brand) {
      return {
        success: false,
        error: "Selected brand does not exist.",
      };
    }
  }

  const product =
    await prisma.$transaction(
      async (tx) => {
        const createdProduct =
          await tx.product.create({
            data: {
              name: data.name,
              slug: data.slug,
              description:
                data.description || null,
              sku: data.sku,
              price: data.price,
              compareAtPrice:
                data.compareAtPrice ?? null,
              categoryId: data.categoryId,
              brandId: data.brandId ?? null,
              isActive: data.isActive,
            },
          });

        await tx.inventory.create({
          data: {
            productId: createdProduct.id,
            stock: 0,
            reserved: 0,
            lowStockThreshold: 5,
          },
        });

        return createdProduct;
      }
    );

  return {
    success: true,
    product,
  };
}