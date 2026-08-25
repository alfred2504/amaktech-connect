import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { productSchema } from "@/features/products/schemas/product-schema";

export async function GET() {
  try {
    const products =
      await prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
        },
        include: {
          category: true,
          brand: true,
          images: true,
          inventory: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(products);
  } catch (error) {
    console.error(
      "GET /api/products error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch products.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    await requirePermission(
      PERMISSIONS.PRODUCT_CREATE
    );

    const body = await request.json();

    const parsed =
      productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product details.",
          issues:
            parsed.error.flatten()
              .fieldErrors,
        },
        {
          status: 400,
        }
      );
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
      return NextResponse.json(
        {
          error:
            "Product SKU or slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          deletedAt: null,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Category does not exist.",
        },
        {
          status: 400,
        }
      );
    }

    if (data.brandId) {
      const brand =
        await prisma.brand.findFirst({
          where: {
            id: data.brandId,
            deletedAt: null,
          },
        });

      if (!brand) {
        return NextResponse.json(
          {
            error:
              "Brand does not exist.",
          },
          {
            status: 400,
          }
        );
      }
    }

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
                compareAtPrice:
                  data.compareAtPrice === ""
                    ? null
                    : data.compareAtPrice ??
                      null,
                categoryId:
                  data.categoryId,
                brandId:
                  data.brandId || null,
                isActive:
                  data.isActive,
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

    return NextResponse.json(
      {
        message:
          "Product created successfully.",
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/products error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create product.",
      },
      {
        status: 500,
      }
    );
  }
}