import Link from "next/link";

type CartSummaryProps = {
  subtotal: number;
};

export function CartSummary({
  subtotal,
}: CartSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            Subtotal
          </span>

          <span className="font-medium">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            Shipping
          </span>

          <span className="text-slate-500">
            Calculated at checkout
          </span>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-bold text-slate-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/store"
        className="mt-3 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Continue Shopping
      </Link>
    </div>
  );
}