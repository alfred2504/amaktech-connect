"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestPasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to send reset email.");
      return;
    }

    setMessage(result.message ?? "If an account exists with that email, a password reset link has been sent.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="w-full space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">AmakTech Connect</p>
          <h1 className="text-3xl font-bold">Forgot your password?</h1>
          <p className="text-slate-600">Enter your email and we’ll send a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-6">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            {loading ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>
      </section>
    </main>
  );
}
