"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AddressSelector,
  Address,
} from "./address-selector";

type CheckoutTotals = {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
};

export function CheckoutForm() {
  const [totals, setTotals] =
    useState<CheckoutTotals | null>(null);
  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCheckout() {
      try {
        const response = await fetch(
          "/api/checkout",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load checkout."
          );
        }

        setTotals(data.totals);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, []);

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
      </div>
    );
  }

  if (!totals) {
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Delivery Information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Select or add your delivery address.
        </p>

        <div className="mt-8">
          <AddressSelector
            selectedAddressId={
              selectedAddress?.id ?? null
            }
            onSelect={setSelectedAddress}
          />

          {selectedAddress && (
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Delivery to
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {selectedAddress.firstName}{" "}
                {selectedAddress.lastName},{" "}
                {selectedAddress.line1},{" "}
                {selectedAddress.city},{" "}
                {selectedAddress.country}
              </p>
            </div>
          )}
        </div>

        <h2 className="mt-10 text-xl font-semibold text-slate-900">
          Payment Method
        </h2>

        <div className="mt-4 rounded-lg border border-slate-200 p-4">
          <p className="font-medium text-slate-900">
            Payment integration
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Payment options will be configured
            before production checkout.
          </p>
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span>
              ${totals.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Tax
            </span>

            <span>
              ${totals.tax.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Shipping
            </span>

            <span>
              ${totals.shipping.toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-xl font-bold">
                ${totals.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}