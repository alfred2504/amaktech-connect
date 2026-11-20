import Link from 'next/link'
import { requireVendor } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function VendorDashboard() {
  const user = await requireVendor()
  const seller = await prisma.seller.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })
  const [products, activeProducts] = seller
    ? await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.product.count({ where: { sellerId: seller.id, status: 'ACTIVE' } }),
    ])
    : [0, 0]

  return <main className="container" style={{ paddingTop: 40 }}>
    <p style={{ color: '#319b19', fontWeight: 700, letterSpacing: 1 }}>AMAKTECH CONNECT VENDOR</p>
    <h1>Welcome, {user.name}</h1>
    <p>Manage your catalog and keep your products ready for customers.</p>
    <div className="grid grid-3" style={{ marginTop: 30 }}>
      <div className="card"><h2>{products}</h2><p>Total products</p></div>
      <div className="card"><h2>{activeProducts}</h2><p>Active products</p></div>
      <Link className="card" href="/products"><h2>Catalog</h2><p>View the storefront</p></Link>
    </div>
  </main>
}