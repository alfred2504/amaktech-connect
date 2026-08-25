import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
    <section className="w-full space-y-6">
      <div><p className="text-sm font-medium text-green-700">AmakTech Connect</p>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="text-slate-600">Sign in to your account.</p></div>
      <LoginForm />
      <div className="text-center space-y-4">
        <div className="space-y-2 text-sm">
          <Link href="/request-password-reset" className="block text-green-700 hover:underline">
            Forgot your password?
          </Link>
          <Link href="/resend-verification" className="block text-green-700 hover:underline">
            Resend verification email
          </Link>
        </div>
        <p className="text-slate-600 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-green-700 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  </main>;
}
