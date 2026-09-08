import Link from 'next/link'
import { requireVendor } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function VendorDashboard() {
  const user = await requireVendor()
  const [products, activeProducts] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>('SELECT COUNT(*)::bigint AS count FROM public."Product" WHERE "deletedAt" IS NULL'),
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>('SELECT COUNT(*)::bigint AS count FROM public."Product" WHERE "deletedAt" IS NULL AND "isActive" = TRUE'),
  ])

  return <main className="container" style={{ paddingTop: 40 }}>
    <p style={{ color: '#319b19', fontWeight: 700, letterSpacing: 1 }}>AMAKTECH CONNECT VENDOR</p>
    <h1>Welcome, {user.name}</h1>
    <p>Manage your catalog and keep your products ready for customers.</p>
    <div className="grid grid-3" style={{ marginTop: 30 }}>
      <div className="card"><h2>{Number(products[0].count)}</h2><p>Total products</p></div>
      <div className="card"><h2>{Number(activeProducts[0].count)}</h2><p>Active products</p></div>
      <Link className="card" href="/products"><h2>Catalog</h2><p>View the storefront</p></Link>
    </div>
  </main>
}