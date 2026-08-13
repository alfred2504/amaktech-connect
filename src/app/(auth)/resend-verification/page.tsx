"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to resend the verification email.");
        return;
      }

      setMessage(result.message);
    } catch {
      setError("Unable to resend the verification email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="w-full space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">AmakTech Connect</p>
          <h1 className="text-3xl font-bold">Resend verification email</h1>
          <p className="text-slate-600">Enter your email and we&apos;ll send a new verification link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-6">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            {loading ? "Sending verification link..." : "Send verification link"}
          </button>
        </form>
        <p className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">Back to login</Link>
        </p>
      </section>
    </main>
  );
}
