import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const product =
      await prisma.product.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: {
              createdAt: "asc",
            },
          },
          inventory: true,
          reviews: true,
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

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch product.",
      },
      {
        status: 500,
      }
    );
  }
}