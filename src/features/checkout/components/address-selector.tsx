"use client";

import { useEffect, useState } from "react";
import { Plus, MapPin, Loader2 } from "lucide-react";

import { AddressForm } from "./address-form";

export type Address = {
  id: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressSelectorProps = {
  selectedAddressId: string | null;
  onSelect: (address: Address) => void;
};

export function AddressSelector({
  selectedAddressId,
  onSelect,
}: AddressSelectorProps) {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const response = await fetch(
          "/api/addresses",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setAddresses(data.addresses);

        const defaultAddress =
          data.addresses.find(
            (address: Address) =>
              address.isDefault
          );

        if (
          defaultAddress &&
          !selectedAddressId
        ) {
          onSelect(defaultAddress);
        }
      } catch (error) {
        console.error(
          "Failed to load addresses:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [onSelect, selectedAddressId]);

  function handleCreated(address: Address) {
    setAddresses((current) => [
      address,
      ...current,
    ]);

    onSelect(address);
    setShowForm(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold">
          Add Delivery Address
        </h3>

        <AddressForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-400" />

          <p className="mt-3 font-medium">
            No delivery addresses
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add an address to continue checkout.
          </p>
        </div>
      )}

      {addresses.map((address) => {
        const selected =
          selectedAddressId === address.id;

        return (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address)}
            className={`w-full rounded-xl border p-5 text-left transition ${
              selected
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {address.firstName}{" "}
                    {address.lastName}
                  </span>

                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {address.line1}
                  {address.line2 &&
                    `, ${address.line2}`}
                </p>

                <p className="text-sm text-slate-600">
                  {address.city},{" "}
                  {address.state}{" "}
                  {address.postalCode}
                </p>

                <p className="text-sm text-slate-600">
                  {address.country}
                </p>
              </div>

              <div
                className={`mt-1 h-5 w-5 rounded-full border-2 ${
                  selected
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300"
                }`}
              />
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-5 w-5" />

        Add New Address
      </button>
    </div>
  );
}