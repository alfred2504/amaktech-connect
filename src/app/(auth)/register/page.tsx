import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
    <section className="w-full space-y-6">
      <div><p className="text-sm font-medium text-green-700">AmakTech Connect</p>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="text-slate-600">Join AmakTech Connect and start shopping.</p></div>
      <RegisterForm />
      <div className="text-center text-sm">
        <p className="text-slate-600">Already have an account?{" "}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </section>
  </main>;
}