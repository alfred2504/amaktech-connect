import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requirePermission(
      PERMISSIONS.INVENTORY_UPDATE
    );

    const { id } = await context.params;

    const body = await request.json();

    const quantity = Number(body.quantity);
    const type = String(body.type);
    const reason = body.reason
      ? String(body.reason)
      : null;

    const reference = body.reference
      ? String(body.reference)
      : null;

    const allowedTypes = [
      "RESTOCK",
      "SALE",
      "RETURN",
      "DAMAGE",
      "ADJUSTMENT",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "Invalid inventory transaction type.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a non-zero integer.",
        },
        { status: 400 }
      );
    }

    const inventory =
      await prisma.inventory.findUnique({
        where: {
          productId: id,
        },
      });

    if (!inventory) {
      return NextResponse.json(
        {
          error: "Inventory record not found.",
        },
        { status: 404 }
      );
    }

    const newStock =
      inventory.stock + quantity;

    if (newStock < 0) {
      return NextResponse.json(
        {
          error:
            "Inventory cannot become negative.",
        },
        { status: 400 }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedInventory =
            await tx.inventory.update({
              where: {
                productId: id,
              },
              data: {
                stock: newStock,
              },
            });

          const transaction =
            await tx.inventoryTransaction.create({
              data: {
                productId: id,
                type,
                quantity,
                previousStock:
                  inventory.stock,
                newStock,
                reason,
                reference,
                createdById: session.user.id,
              },
            });

          return {
            updatedInventory,
            transaction,
          };
        }
      );

    return NextResponse.json({
      message:
        "Inventory adjusted successfully.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Inventory adjustment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to adjust inventory.",
      },
      { status: 500 }
    );
  }
}