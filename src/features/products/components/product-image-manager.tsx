"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name);

      const response = await fetch(
        `/api/products/${productId}/images/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload image.");
        return;
      }

      setImages((current) => [...current, data.image]);
    } catch {
      setError("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage(imageId: string) {
    if (!window.confirm("Delete this product image?")) return;

    setError("");

    try {
      const response = await fetch(
        `/api/products/${productId}/images/${imageId}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete image.");
        return;
      }

      setImages((current) =>
        current.filter((image) => image.id !== imageId)
      );
    } catch {
      setError("Failed to delete image.");
    }
  }

  async function setPrimary(imageId: string) {
    setError("");

    try {
      const response = await fetch(
        `/api/products/${productId}/images/${imageId}`,
        { method: "PATCH" }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update image.");
        return;
      }

      setImages((current) =>
        current.map((image) => ({
          ...image,
          isPrimary: image.id === imageId,
        }))
      );
    } catch {
      setError("Failed to update image.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Product Images</h2>
        <p className="text-sm text-muted-foreground">
          Upload JPG, PNG or WebP images up to 5MB.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-dashed p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={async (event) => {
            const files = Array.from(event.target.files || []);

            for (const file of files) {
              await uploadImage(file);
            }

            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Images"}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No images uploaded yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg border"
            >
              <Image
                src={image.url}
                alt={image.altText || "Product image"}
                width={500}
                height={500}
                unoptimized
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-2 p-3">
                {image.isPrimary ? (
                  <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimary(image.id)}
                    className="text-xs font-medium text-blue-600"
                  >
                    Make Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteImage(image.id)}
                  className="block text-xs font-medium text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}