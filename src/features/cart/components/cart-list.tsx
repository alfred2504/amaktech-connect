"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { CartEmpty } from "./cart-empty";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";

type Cart = {
  id: string;
  items: {
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
  }[];
};

export function CartList() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cart");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load cart."
        );
      }

      setCart(data.cart);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load cart."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadCart();
    });
  }, []);

  async function updateItem(
    productId: string,
    quantity: number
  ) {
    try {
      const response = await fetch(
        `/api/cart/items/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update cart."
        );
      }

      setCart(data.cart);
      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update cart."
      );
    }
  }

  async function removeItem(productId: string) {
    try {
      const response = await fetch(
        `/api/cart/items/${productId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to remove item."
        );
      }

      setCart(data.cart);
      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove item."
      );
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error}

        <button
          type="button"
          onClick={loadCart}
          className="ml-4 font-semibold underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
  }

  const subtotal = cart.items.reduce(
    (total, item) =>
      total + Number(item.unitPrice) * item.quantity,
    0
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-xl border border-slate-200 bg-white px-6">
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div>
        <CartSummary subtotal={subtotal} />
      </div>
    </div>
  );
}