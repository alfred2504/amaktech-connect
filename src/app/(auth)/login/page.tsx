import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
    <section className="w-full space-y-6">
      <div><p className="text-sm font-medium text-blue-600">AmakTech Connect</p>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="text-slate-600">Sign in to your account.</p></div>
      <LoginForm />
    </section>
  </main>;
}