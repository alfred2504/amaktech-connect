import { requireAuth } from "@/lib/authorization";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Welcome, {session.user.name ?? "Customer"}</h1>
      <p className="mt-2 text-slate-600">Signed in as {session.user.role}.</p>
    </main>
  );
}