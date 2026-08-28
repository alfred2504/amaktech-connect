import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Checkout
          </h1>

          <p className="mt-2 text-slate-500">
            Complete your order securely.
          </p>
        </div>

        <CheckoutForm />
      </div>
    </main>
  );
}