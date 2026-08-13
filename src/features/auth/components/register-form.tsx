"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let result: { success?: boolean; error?: string } = {};

      try {
        if (text) {
          result = JSON.parse(text);
        }
      } catch {
        setError("Unexpected server response.");
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Unable to create account.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(["name", "email", "password", "confirmPassword"] as const).map((field) => (
        <input key={field}
          type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
          required placeholder={field === "confirmPassword" ? "Confirm password" : field[0].toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full rounded-md border px-3 py-2" />
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}