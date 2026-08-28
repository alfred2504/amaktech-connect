"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AddressFormProps = {
  onCreated: (address: any) => void;
  onCancel: () => void;
};

export function AddressForm({
  onCreated,
  onCancel,
}: AddressFormProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Zimbabwe",
    isDefault: false,
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save address."
        );
      }

      toast.success("Address added successfully.");

      onCreated(data.address);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save address."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            First Name
          </label>

          <input
            required
            value={form.firstName}
            onChange={(event) =>
              updateField(
                "firstName",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Last Name
          </label>

          <input
            required
            value={form.lastName}
            onChange={(event) =>
              updateField(
                "lastName",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Address
        </label>

        <input
          required
          value={form.line1}
          onChange={(event) =>
            updateField(
              "line1",
              event.target.value
            )
          }
          placeholder="Street address"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Apartment / Unit
        </label>

        <input
          value={form.line2}
          onChange={(event) =>
            updateField(
              "line2",
              event.target.value
            )
          }
          placeholder="Optional"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            City
          </label>

          <input
            required
            value={form.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Province / State
          </label>

          <input
            required
            value={form.state}
            onChange={(event) =>
              updateField(
                "state",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Postal Code
          </label>

          <input
            required
            value={form.postalCode}
            onChange={(event) =>
              updateField(
                "postalCode",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Country
          </label>

          <input
            required
            value={form.country}
            onChange={(event) =>
              updateField(
                "country",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) =>
            updateField(
              "isDefault",
              event.target.checked
            )
          }
          className="h-4 w-4"
        />

        <span className="text-sm text-slate-700">
          Make this my default address
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          Save Address
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}