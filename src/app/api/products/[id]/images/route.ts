import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const images =
      await prisma.productImage.findMany({
        where: {
          productId: id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json(images);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch product images.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requirePermission(
      PERMISSIONS.PRODUCT_UPDATE
    );

    const { id } = await context.params;

    const product =
      await prisma.product.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    const altText =
      typeof body.altText === "string"
        ? body.altText.trim()
        : null;

    if (!url) {
      return NextResponse.json(
        {
          error: "Image URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid image URL.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCount =
      await prisma.productImage.count({
        where: {
          productId: id,
        },
      });

    const image =
      await prisma.$transaction(
        async (tx) => {
          if (existingCount === 0) {
            return tx.productImage.create({
              data: {
                productId: id,
                url,
                altText,
                isPrimary: true,
              },
            });
          }

          return tx.productImage.create({
            data: {
              productId: id,
              url,
              altText,
              isPrimary: false,
            },
          });
        }
      );

    return NextResponse.json(
      {
        message:
          "Product image added successfully.",
        image,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to add product image.",
      },
      {
        status: 500,
      }
    );
  }
}