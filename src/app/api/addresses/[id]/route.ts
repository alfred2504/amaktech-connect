import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid address details.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const makeDefault = data.isDefault === true;

    const address = await prisma.$transaction(
      async (tx) => {
        if (makeDefault) {
          await tx.address.updateMany({
            where: {
              userId: user.id,
              deletedAt: null,
              NOT: {
                id,
              },
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.address.update({
          where: {
            id,
          },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            line1: data.line1,
            line2: data.line2 || null,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            isDefault: makeDefault,
          },
        });
      }
    );

    return NextResponse.json({
      address,
    });
  } catch (error) {
    console.error(
      "PATCH /api/addresses/[id]:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update address.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    await prisma.address.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isDefault: false,
      },
    });

    if (address.isDefault) {
      const nextAddress =
        await prisma.address.findFirst({
          where: {
            userId: user.id,
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (nextAddress) {
        await prisma.address.update({
          where: {
            id: nextAddress.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/addresses/[id]:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to delete address.",
      },
      { status: 500 }
    );
  }
}