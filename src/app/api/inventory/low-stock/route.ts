import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

export async function GET(
  _request: NextRequest
) {
  try {
    await requirePermission(
      PERMISSIONS.INVENTORY_READ
    );

    const inventory =
      await prisma.inventory.findMany({
        where: {
          product: {
            deletedAt: null,
            isActive: true,
          },
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
        orderBy: {
          stock: "asc",
        },
      });

    const lowStock =
      inventory.filter(
        (item) =>
          item.stock -
            item.reserved <=
          item.lowStockThreshold
      );

    return NextResponse.json(
      lowStock
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch low-stock products.",
      },
      { status: 500 }
    );
  }
}