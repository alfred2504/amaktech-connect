import Link from 'next/link'
import { AuthFrame } from '@/components/AuthFrame'

export default function RegisterPage() {
  return <AuthFrame title="Create your account" subtitle="Join AmakTech Connect and discover your next favorite products.">
    <form className="auth-form" method="post" action="/api/auth/register">
      <label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required />
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <button type="submit">Create account</button>
    </form>
    <div className="auth-links"><span>Already have an account?</span><Link href="/login">Sign in</Link></div>
  </AuthFrame>
}