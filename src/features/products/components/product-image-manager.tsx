"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

type Props = {
  productId: string;
  initialImages: ProductImage[];
};

export function ProductImageManager({
  productId,
  initialImages,
}: Props) {
  const [images, setImages] =
    useState(initialImages);

  const [url, setUrl] = useState("");
  const [altText, setAltText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function addImage() {
    setLoading(true);
    setError("");

    const response = await fetch(
      `/api/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          url,
          altText,
        }),
      }
    );

    const data =
      await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(
        data.error ||
          "Failed to add image."
      );
      return;
    }

    setImages((current) => [
      ...current,
      data.image,
    ]);

    setUrl("");
    setAltText("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Product Images
        </h2>

        <p className="text-sm text-muted-foreground">
          Add product images using image URLs.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-lg border p-4">
        <input
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
          placeholder="https://example.com/product.jpg"
          className="w-full rounded-md border px-3 py-2"
        />

        <input
          value={altText}
          onChange={(e) =>
            setAltText(e.target.value)
          }
          placeholder="Image description"
          className="w-full rounded-md border px-3 py-2"
        />

        <button
          type="button"
          onClick={addImage}
          disabled={
            loading || !url.trim()
          }
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Adding..."
            : "Add Image"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg border"
          >
            <Image
              src={image.url}
              alt={
                image.altText ||
                "Product image"
              }
              width={500}
              height={500}
              className="aspect-square w-full object-cover"
            />

            <div className="p-3">
              {image.isPrimary && (
                <span className="text-xs font-medium">
                  Primary image
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}