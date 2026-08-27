"use client";

import { useState } from "react";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({
  images,
  productName,
}: Props) {
  const fallback = "/images/product-placeholder.png";

  const [selected, setSelected] = useState(
    images.find((image) => image.isPrimary)?.url ||
      images[0]?.url ||
      fallback
  );

  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border bg-white">
        <img
          src={selected}
          alt={productName}
          className="h-full w-full object-contain p-8"
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() =>
                setSelected(image.url)
              }
              className={`aspect-square overflow-hidden rounded-lg border bg-white ${
                selected === image.url
                  ? "border-blue-600 ring-2 ring-blue-600/20"
                  : "border-slate-200"
              }`}
            >
              <img
                src={image.url}
                alt={
                  image.altText ||
                  productName
                }
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}