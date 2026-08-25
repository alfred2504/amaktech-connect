import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { supabaseAdmin } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const STORAGE_BUCKET = "product-images";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requirePermission(
      PERMISSIONS.PRODUCT_UPDATE
    );

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 }
      );
    }

    const { id } = await context.params;

    const product =
      await prisma.product.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const altText =
      formData.get("altText");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Image file is required.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Image must be smaller than 5MB.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const fileName =
      `${randomUUID()}.${extension}`;

    const storagePath =
      `products/${product.id}/${fileName}`;

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    const { data: bucket } =
      await supabaseAdmin.storage.getBucket(
        STORAGE_BUCKET
      );

    if (!bucket) {
      const { error: bucketError } =
        await supabaseAdmin.storage.createBucket(
          STORAGE_BUCKET,
          { public: true }
        );

      if (bucketError && bucketError.statusCode !== "409") {
        console.error(
          "Supabase bucket error:",
          bucketError
        );

        return NextResponse.json(
          {
            error:
              "Product image storage is not configured.",
          },
          { status: 503 }
        );
      }
    } else if (!bucket.public) {
      const { error: updateBucketError } =
        await supabaseAdmin.storage.updateBucket(
          STORAGE_BUCKET,
          { public: true }
        );

      if (updateBucketError) {
        console.error(
          "Supabase bucket visibility error:",
          updateBucketError
        );

        return NextResponse.json(
          {
            error:
              "Product image storage is not public.",
          },
          { status: 503 }
        );
      }
    }

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(
          storagePath,
          buffer,
          {
            contentType: file.type,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "Supabase upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "Failed to upload image.",
        },
        { status: 500 }
      );
    }

    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    const existingImages =
      await prisma.productImage.count({
        where: {
          productId: product.id,
        },
      });

    const image =
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: publicUrlData.publicUrl,
          altText:
            typeof altText === "string"
              ? altText
              : product.name,
          isPrimary:
            existingImages === 0,
        },
      });

    return NextResponse.json(
      {
        message:
          "Image uploaded successfully.",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Product image upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to upload product image.",
      },
      { status: 500 }
    );
  }
}