"use client";

import { useEffect, useState } from "react";
import {
  Edit,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import {
  AddressForm,
} from "./address-form";

import type {
  Address,
} from "./address-selector";

export function AddressManagement() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState<Address | null>(null);

  const [adding, setAdding] =
    useState(false);

  async function loadAddresses() {
    try {
      setLoading(true);

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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load addresses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function deleteAddress(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this address?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/addresses/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(
        "Address deleted successfully."
      );

      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete address."
      );
    }
  }

  async function setDefault(
    id: string
  ) {
    try {
      const response = await fetch(
        `/api/addresses/${id}/default`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(
        "Default address updated."
      );

      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update default address."
      );
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (adding) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Add New Address
        </h2>

        <AddressForm
          onCreated={() => {
            setAdding(false);
            loadAddresses();
          }}
          onCancel={() =>
            setAdding(false)
          }
        />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Edit Address
        </h2>

        <EditAddressForm
          address={editing}
          onSaved={() => {
            setEditing(null);
            loadAddresses();
          }}
          onCancel={() =>
            setEditing(null)
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            My Addresses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your delivery addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-400" />

          <p className="mt-3 font-medium">
            No saved addresses
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {address.firstName}{" "}
                    {address.lastName}
                  </p>

                  {address.isDefault && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      <Star className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                <p>{address.line1}</p>

                {address.line2 && (
                  <p>{address.line2}</p>
                )}

                <p>
                  {address.city},{" "}
                  {address.state}
                </p>

                <p>
                  {address.postalCode},{" "}
                  {address.country}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditing(address)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() =>
                      setDefault(address.id)
                    }
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Set Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    deleteAddress(address.id)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditAddressForm({
  address,
  onSaved,
  onCancel,
}: {
  address: Address;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    firstName: address.firstName,
    lastName: address.lastName,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  });

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `/api/addresses/${address.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(
        "Address updated successfully."
      );

      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update address."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          value={form.firstName}
          onChange={(e) =>
            updateField(
              "firstName",
              e.target.value
            )
          }
          placeholder="First name"
          className="rounded-lg border px-3 py-2.5"
        />

        <input
          required
          value={form.lastName}
          onChange={(e) =>
            updateField(
              "lastName",
              e.target.value
            )
          }
          placeholder="Last name"
          className="rounded-lg border px-3 py-2.5"
        />
      </div>

      <input
        required
        value={form.line1}
        onChange={(e) =>
          updateField(
            "line1",
            e.target.value
          )
        }
        placeholder="Street address"
        className="w-full rounded-lg border px-3 py-2.5"
      />

      <input
        value={form.line2}
        onChange={(e) =>
          updateField(
            "line2",
            e.target.value
          )
        }
        placeholder="Apartment / Unit (optional)"
        className="w-full rounded-lg border px-3 py-2.5"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          value={form.city}
          onChange={(e) =>
            updateField(
              "city",
              e.target.value
            )
          }
          placeholder="City"
          className="rounded-lg border px-3 py-2.5"
        />

        <input
          required
          value={form.state}
          onChange={(e) =>
            updateField(
              "state",
              e.target.value
            )
          }
          placeholder="Province / State"
          className="rounded-lg border px-3 py-2.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          value={form.postalCode}
          onChange={(e) =>
            updateField(
              "postalCode",
              e.target.value
            )
          }
          placeholder="Postal code"
          className="rounded-lg border px-3 py-2.5"
        />

        <input
          required
          value={form.country}
          onChange={(e) =>
            updateField(
              "country",
              e.target.value
            )
          }
          placeholder="Country"
          className="rounded-lg border px-3 py-2.5"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            updateField(
              "isDefault",
              e.target.checked
            )
          }
        />

        <span className="text-sm">
          Make this my default address
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-5 py-2.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}