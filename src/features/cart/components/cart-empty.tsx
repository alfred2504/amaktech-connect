import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart className="mb-4 h-16 w-16 text-slate-300" />

      <h2 className="text-2xl font-semibold text-slate-900">
        Your cart is empty
      </h2>

      <p className="mt-2 text-slate-500">
        Add some products to your cart and they will appear here.
      </p>

      <Link
        href="/store"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Continue Shopping
      </Link>
    </div>
  );
}