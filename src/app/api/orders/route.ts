import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createOrder } from "@/features/orders/services/create-order";

export async function POST(
  request: Request
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const addressId =
      typeof body.addressId === "string"
        ? body.addressId
        : "";

    if (!addressId) {
      return NextResponse.json(
        {
          error:
            "A delivery address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await createOrder({
        userId: session.user.id,
        addressId,
      });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber:
            order.orderNumber,
          status: order.status,
          paymentStatus:
            order.paymentStatus,
          subtotal:
            order.subtotal.toString(),
          tax:
            order.tax.toString(),
          shipping:
            order.shipping.toString(),
          total:
            order.total.toString(),
          items: ((order as any).items ?? []).map(
            (item: any) => ({
              id: item.id,
              productId:
                item.productId,
              productName:
                item.product.name,
              quantity:
                item.quantity,
              unitPrice:
                item.unitPrice.toString(),
              totalPrice:
                item.totalPrice.toString(),
            })
          ),
          address:
            (order as any).address,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/orders:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create order.";

    if (message === "CART_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Your cart was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (message === "CART_EMPTY") {
      return NextResponse.json(
        {
          error:
            "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message ===
      "DELIVERY_ADDRESS_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "The selected delivery address is invalid.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      message.startsWith(
        "PRODUCT_UNAVAILABLE:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products are no longer available.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      message.startsWith(
        "INVENTORY_NOT_CONFIGURED:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Inventory is not configured for one of the products.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products do not have enough stock.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create your order.",
      },
      {
        status: 500,
      }
    );
  }
}