import { requireSuperAdmin } from '@/lib/auth'
import { AdminShell } from '@/components/AdminShell'
import AdministratorsClient from './AdministratorsClient'

export default async function AdministratorsPage() {
  await requireSuperAdmin()

  return (
    <AdminShell
      title="Administrators"
      description="Grant or remove administrator access for existing customer accounts."
    >
      <AdministratorsClient />
    </AdminShell>
  )
}
