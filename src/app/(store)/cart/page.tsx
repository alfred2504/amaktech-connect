import { CartList } from "@/features/cart/components/cart-list";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Shopping Cart
          </h1>

          <p className="mt-2 text-slate-500">
            Review your items before proceeding to checkout.
          </p>
        </div>

        <CartList />
      </div>
    </main>
  );
}