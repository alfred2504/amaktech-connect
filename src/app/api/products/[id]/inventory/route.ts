import {
  NextRequest,
  NextResponse,
} from "next/server";

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
    await requirePermission(
      PERMISSIONS.INVENTORY_READ
    );

    const { id } = await context.params;

    const inventory =
      await prisma.inventory.findUnique({
        where: {
          productId: id,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

    if (!inventory) {
      return NextResponse.json(
        {
          error:
            "Inventory record not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      inventory
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch inventory.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requirePermission(
      PERMISSIONS.INVENTORY_UPDATE
    );

    const { id } = await context.params;
    const body = await request.json();

    const stock = Number(body.stock);
    const reserved = Number(body.reserved);
    const lowStockThreshold = Number(
      body.lowStockThreshold
    );

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          error:
            "Stock must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(reserved) || reserved < 0) {
      return NextResponse.json(
        {
          error:
            "Reserved stock must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Low-stock threshold must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    if (reserved > stock) {
      return NextResponse.json(
        {
          error:
            "Reserved stock cannot exceed total stock.",
        },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.update({
      where: {
        productId: id,
      },
      data: {
        stock,
        reserved,
        lowStockThreshold,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update inventory.",
      },
      { status: 500 }
    );
  }
}