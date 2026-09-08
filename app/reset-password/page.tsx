import { AuthFrame } from '@/components/AuthFrame'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token || ''
  return <AuthFrame title="Choose a new password" subtitle="Create a fresh password for your AmakTech Connect account.">
    <form className="auth-form" method="post" action="/api/auth/reset-password">
      <input type="hidden" name="token" value={token} />
      <label htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
      <button type="submit">Update password</button>
    </form>
  </AuthFrame>
}