import Link from 'next/link'
import { AuthFrame } from '@/components/AuthFrame'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams
  return <AuthFrame title="Reset your password" subtitle="Enter your email and we will help you get back into your account.">
    <form className="auth-form" method="post" action="/api/auth/request-reset">
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required />
      <button type="submit">Send reset link</button>
    </form>
    {params.sent && <p role="status">If an active account matches that email, a reset link will be sent shortly.</p>}
    {params.error && <p className="form-error" role="alert">Password reset email is unavailable. Please try again later.</p>}
    <p className="auth-note">Password reset requires configured email delivery.</p>
    <div className="auth-links"><Link href="/login">Back to sign in</Link><Link href="/register">Create account</Link></div>
  </AuthFrame>
}