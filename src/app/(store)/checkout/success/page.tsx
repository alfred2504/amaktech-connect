import Link from "next/link";

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function
CheckoutSuccessPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const orderNumber =
    params.order;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Order Received
          </h1>

          <p className="mt-3 text-slate-600">
            Thank you for shopping with
            AmakTech Connect.
          </p>

          {orderNumber && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Order Number
              </p>

              <p className="mt-1 text-xl font-bold">
                {orderNumber}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account/orders"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              View My Orders
            </Link>

            <Link
              href="/products"
              className="rounded-lg border px-5 py-3 font-medium hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}