"use client";

import { useState } from "react";

type Inventory = {
  stock: number;
  reserved: number;
  lowStockThreshold: number;
};

type Props = {
  productId: string;
  initialInventory: Inventory;
};

export function InventoryManager({
  productId,
  initialInventory,
}: Props) {
  const [stock, setStock] =
    useState(
      String(initialInventory.stock)
    );

  const [reserved, setReserved] =
    useState(
      String(
        initialInventory.reserved
      )
    );

  const [
    lowStockThreshold,
    setLowStockThreshold,
  ] = useState(
    String(
      initialInventory.lowStockThreshold
    )
  );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const available =
    Number(stock) -
    Number(reserved);

  async function saveInventory() {
    setLoading(true);
    setMessage("");

    const response =
      await fetch(
        `/api/products/${productId}/inventory`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            stock: Number(stock),
            reserved: Number(reserved),
            lowStockThreshold:
              Number(
                lowStockThreshold
              ),
          }),
        }
      );

    const data =
      await response.json();

    setLoading(false);

    if (!response.ok) {
      setMessage(
        data.error ||
          "Failed to update inventory."
      );

      return;
    }

    setMessage(
      "Inventory updated successfully."
    );
  }

  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Inventory
        </h2>

        <p className="text-sm text-muted-foreground">
          Manage stock levels for this product.
        </p>
      </div>

      {message && (
        <div className="rounded-md bg-muted p-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Total Stock
          </label>

          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reserved
          </label>

          <input
            type="number"
            min="0"
            value={reserved}
            onChange={(e) =>
              setReserved(
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Low Stock Threshold
          </label>

          <input
            type="number"
            min="0"
            value={
              lowStockThreshold
            }
            onChange={(e) =>
              setLowStockThreshold(
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-5">
        <p className="text-sm text-muted-foreground">
          Available Stock
        </p>

        <p
          className={`text-3xl font-bold ${
            available <=
            Number(
              lowStockThreshold
            )
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {available}
        </p>
      </div>

      <button
        type="button"
        onClick={saveInventory}
        disabled={
          loading ||
          available < 0
        }
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : "Save Inventory"}
      </button>
    </div>
  );
}