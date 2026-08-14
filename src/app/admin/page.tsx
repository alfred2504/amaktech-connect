import { requireRole } from "@/lib/authorization";

export default async function AdminPage() {
  const session = await requireRole(["Administrator", "Super Administrator"]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Authorized role: {session.user.role}</p>
    </main>
  );
}