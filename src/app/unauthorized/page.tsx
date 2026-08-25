import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
          <p className="text-xl font-semibold text-gray-900">
            Access Denied
          </p>
        </div>

        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this resource. If you believe this
          is a mistake, please contact support.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
