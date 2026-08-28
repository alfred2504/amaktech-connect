"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export function CartCounter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadCartCount() {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!response.ok) {
        setCount(0);
        return;
      }

      const data = await response.json();

      const totalQuantity =
        data.cart?.items?.reduce(
          (
            total: number,
            item: { quantity: number }
          ) => total + item.quantity,
          0
        ) ?? 0;

      setCount(totalQuantity);
    } catch (error) {
      console.error(
        "Failed to load cart count:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadCartCount();
    });
  }, []);

  useEffect(() => {
    function handleCartUpdated() {
      loadCartCount();
    }

    window.addEventListener(
      "cart-updated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdated
      );
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
      aria-label={`Shopping cart with ${count} items`}
    >
      <ShoppingCart className="h-6 w-6" />

      {!loading && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}