import Link from "next/link";

import { verifyEmail } from "@/features/auth/actions/verify-email";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;

  const token = params.token;

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <section className="w-full rounded-xl border p-8 text-center">
          <h1 className="text-2xl font-bold">
            Invalid verification link
          </h1>

          <p className="mt-3 text-slate-600">
            The verification token is missing.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  const result = await verifyEmail(token);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="w-full rounded-xl border p-8 text-center">
        {result.success ? (
          <>
            <h1 className="text-2xl font-bold">
              Email verified
            </h1>

            <p className="mt-3 text-slate-600">
              Your AmakTech Connect account has been
              successfully verified.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Continue to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              Verification failed
            </h1>

            <p className="mt-3 text-red-600">
              {result.error}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg border px-5 py-2"
            >
              Back to login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}