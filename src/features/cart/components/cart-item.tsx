"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

type CartItemProps = {
  item: {
    id: string;
    quantity: number;
    unitPrice: string | number;
    product: {
      id: string;
      name: string;
      images: {
        url: string;
        altText: string | null;
      }[];
    };
  };
  onUpdate: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
};

export function CartItem({
  item,
  onUpdate,
  onRemove,
}: CartItemProps) {
  const price = Number(item.unitPrice);
  const total = price * item.quantity;

  const image = item.product.images[0]?.url;

  return (
    <div className="flex gap-4 border-b border-slate-200 py-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={
              item.product.images[0]?.altText ||
              item.product.name
            }
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              {item.product.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ${price.toFixed(2)} each
            </p>
          </div>

          <p className="font-semibold text-slate-900">
            ${total.toFixed(2)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              type="button"
              disabled={item.quantity <= 1}
              onClick={() =>
                onUpdate(
                  item.product.id,
                  item.quantity - 1
                )
              }
              className="p-2 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="min-w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onUpdate(
                  item.product.id,
                  item.quantity + 1
                )
              }
              className="p-2"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onRemove(item.product.id)
            }
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}