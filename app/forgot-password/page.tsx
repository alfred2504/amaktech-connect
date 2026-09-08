import Link from 'next/link'
import { AuthFrame } from '@/components/AuthFrame'

export default function ForgotPasswordPage() {
  return <AuthFrame title="Reset your password" subtitle="Enter your email and we will help you get back into your account.">
    <form className="auth-form" method="post" action="/api/auth/request-reset">
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required />
      <button type="submit">Send reset link</button>
    </form>
    <p className="auth-note">For local development, the reset link opens directly after submitting. In production, connect this action to your email provider.</p>
    <div className="auth-links"><Link href="/login">Back to sign in</Link><Link href="/register">Create account</Link></div>
  </AuthFrame>
}