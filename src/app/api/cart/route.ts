import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  addToCart,
  clearCart,
  getCart,
} from "@/features/cart/services/cart-service";

export async function GET() {
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

    const cart = await getCart(
      session.user.id
    );

    return NextResponse.json({
      cart,
    });
  } catch (error) {
    console.error(
      "GET /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load cart.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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

    const body = await request.json();

    const productId = body?.productId;
    const quantity = body?.quantity;

    if (
      typeof productId !== "string" ||
      !productId
    ) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    const cart = await addToCart(
      session.user.id,
      productId,
      quantity
    );

    return NextResponse.json(
      {
        message: "Product added to cart.",
        cart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/cart error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add product to cart.";

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

export async function DELETE() {
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

    const cart = await clearCart(
      session.user.id
    );

    return NextResponse.json({
      message: "Cart cleared.",
      cart,
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to clear cart.",
      },
      {
        status: 500,
      }
    );
  }
}