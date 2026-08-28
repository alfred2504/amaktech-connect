"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  productId: string;
  availableStock: number;
};

export function AddToCart({
  productId,
  availableStock,
}: Props) {
  const [quantity, setQuantity] =
    useState(1);
  const [loading, setLoading] =
    useState(false);

  const disabled =
    availableStock <= 0;

  function increase() {
    setQuantity((current) =>
      Math.min(
        current + 1,
        availableStock
      )
    );
  }

  function decrease() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  async function handleAddToCart() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add product to cart."
        );
      }

      toast.success("Product added to cart.");
      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to add product to cart."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          disabled={disabled || quantity <= 1}
          className="h-11 w-11 rounded-lg border bg-white text-xl disabled:opacity-40"
        >
          -
        </button>

        <span className="flex h-11 min-w-12 items-center justify-center rounded-lg border bg-white">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increase}
          disabled={
            disabled ||
            quantity >= availableStock
          }
          className="h-11 w-11 rounded-lg border bg-white text-xl disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleAddToCart}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading
          ? "Adding..."
          : disabled
          ? "Out of Stock"
          : "Add to Cart"}
      </button>

    </div>
  );
}