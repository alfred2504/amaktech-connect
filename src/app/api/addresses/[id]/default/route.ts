import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
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
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const address =
      await prisma.address.findFirst({
        where: {
          id,
          userId: session.user.id,
          deletedAt: null,
        },
      });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    const updated =
      await prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: {
            userId: session.user.id,
            deletedAt: null,
          },
          data: {
            isDefault: false,
          },
        });

        return tx.address.update({
          where: {
            id,
          },
          data: {
            isDefault: true,
          },
        });
      });

    return NextResponse.json({
      address: updated,
    });
  } catch (error) {
    console.error(
      "PATCH /api/addresses/[id]/default:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to set default address.",
      },
      { status: 500 }
    );
  }
}