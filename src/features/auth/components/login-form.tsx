"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      console.debug("signIn result:", result);

      const ok = (result as any)?.ok ?? false;
      const url = (result as any)?.url as string | undefined;

      if (ok || (url && !((result as any).error))) {
        await router.push(url ?? "/dashboard");
        router.refresh();
        return;
      }

      setError(result?.error ? String((result as any).error) : "Invalid email or password.");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="email" required autoComplete="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border px-3 py-2" />
      <input type="password" required autoComplete="current-password" placeholder="Password"
        value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}