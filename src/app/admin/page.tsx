import { requireRole } from "@/lib/authorization";

export default async function AdminPage() {
  const session = await requireRole([
    "Administrator",
    "Super Administrator",
  ]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Welcome, {session.user.name}.
      </p>
    </main>
  );
}