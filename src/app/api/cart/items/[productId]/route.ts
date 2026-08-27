import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  removeCartItem,
  updateCartItem,
} from "@/features/cart/services/cart-service";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { productId } =
      await context.params;

    const body = await request.json();

    const quantity = body?.quantity;

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a positive integer.",
        },
        {
          status: 400,
        }
      );
    }

    const cart = await updateCartItem(
      session.user.id,
      productId,
      quantity
    );

    return NextResponse.json({
      message: "Cart updated.",
      cart,
    });
  } catch (error) {
    console.error(
      "PATCH /api/cart/items error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update cart.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { productId } =
      await context.params;

    const cart = await removeCartItem(
      session.user.id,
      productId
    );

    return NextResponse.json({
      message: "Product removed from cart.",
      cart,
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart/items error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove product.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}