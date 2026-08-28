import { AddressManagement } from "@/features/checkout/components/address-management";

export default function AddressesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AddressManagement />
      </div>
    </main>
  );
}