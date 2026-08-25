import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { supabaseAdmin } from "@/lib/supabase/server";

function getStoragePath(url: string) {
  const marker =
    "/storage/v1/object/public/product-images/";

  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    url.substring(
      index + marker.length
    )
  );
}

export async function DELETE(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  }
) {
  try {
    await requirePermission(
      PERMISSIONS.PRODUCT_UPDATE
    );

    const {
      id,
      imageId,
    } = await context.params;

    const image =
      await prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId: id,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          error: "Image not found.",
        },
        { status: 404 }
      );
    }

    const storagePath =
      getStoragePath(image.url);

    if (storagePath && supabaseAdmin) {
      const { error } =
        await supabaseAdmin.storage
          .from("product-images")
          .remove([storagePath]);

      if (error) {
        console.error(
          "Storage deletion error:",
          error
        );
      }
    }

    await prisma.productImage.delete({
      where: {
        id: image.id,
      },
    });

    if (image.isPrimary) {
      const nextImage =
        await prisma.productImage.findFirst({
          where: {
            productId: id,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (nextImage) {
        await prisma.productImage.update({
          where: {
            id: nextImage.id,
          },
          data: {
            isPrimary: true,
          },
        });
      }
    }

    return NextResponse.json({
      message:
        "Product image deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to delete product image.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  }
) {
  try {
    await requirePermission(
      PERMISSIONS.PRODUCT_UPDATE
    );

    const {
      id,
      imageId,
    } = await context.params;

    const image =
      await prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId: id,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          error: "Image not found.",
        },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: {
          productId: id,
        },
        data: {
          isPrimary: false,
        },
      }),
      prisma.productImage.update({
        where: {
          id: imageId,
        },
        data: {
          isPrimary: true,
        },
      }),
    ]);

    return NextResponse.json({
      message:
        "Primary image updated successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to update primary image.",
      },
      { status: 500 }
    );
  }
}