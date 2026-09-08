import Link from 'next/link'
import { AuthFrame } from '@/components/AuthFrame'

export default function LoginPage() {
  return <AuthFrame title="Welcome back" subtitle="Sign in to continue to your AmakTech Connect account.">
    <form className="auth-form" method="post" action="/api/auth/login">
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required />
      <button type="submit">Sign in</button>
    </form>
    <div className="auth-links"><Link href="/forgot-password">Forgot password?</Link><span>New here? <Link href="/register">Create account</Link></span></div>
  </AuthFrame>
}