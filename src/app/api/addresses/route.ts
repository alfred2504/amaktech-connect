import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  line1: z.string().min(1, "Address is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State/Province is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  country: z.string().min(1, "Country is required."),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      addresses,
    });
  } catch (error) {
    console.error("GET /api/addresses:", error);

    return NextResponse.json(
      { error: "Unable to load addresses." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
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

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          deletedAt: null,
        },
      });

    const shouldBeDefault =
      data.isDefault === true ||
      !existingAddress;

    const address = await prisma.$transaction(
      async (tx) => {
        if (shouldBeDefault) {
          await tx.address.updateMany({
            where: {
              userId: session.user.id,
              deletedAt: null,
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.address.create({
          data: {
            userId: session.user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            line1: data.line1,
            line2: data.line2 || null,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            isDefault: shouldBeDefault,
          },
        });
      }
    );

    return NextResponse.json(
      {
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/addresses:", error);

    return NextResponse.json(
      { error: "Unable to create address." },
      { status: 500 }
    );
  }
}