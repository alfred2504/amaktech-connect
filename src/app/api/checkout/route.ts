import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  calculateOrderTotals,
} from "@/features/checkout/services/checkout-service";

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

    const totals =
      await calculateOrderTotals(
        session.user.id
      );

    return NextResponse.json({
      totals,
    });
  } catch (error) {
    console.error(
      "GET /api/checkout:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate checkout.",
      },
      {
        status: 400,
      }
    );
  }
}