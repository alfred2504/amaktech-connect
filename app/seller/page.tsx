import Link from 'next/link'
import { getAuthenticatedUser } from '@/lib/auth'

export default async function SellerPage() {
  const user = await getAuthenticatedUser()
  if (user?.role === 'SELLER') {
    return <main className="container section"><h1>Seller portal</h1><p>Manage your store, products, orders, fulfillment, and payouts.</p><Link className="button primary" href="/seller/dashboard">Open seller dashboard</Link></main>
  }

  return (
    <main className="container section simple-page">
      <span className="eyebrow">SELL ON AMAKTECH CONNECT</span>
      <h1>Grow your business online.</h1>
      <p>Apply to open a store. Your application will be reviewed before products can be published.</p>
      <div className="simple-card">
        <h2>Start selling</h2>
        <Link className="button primary" href={user ? '/seller/apply' : '/login?next=%2Fseller%2Fapply'}>Apply to become a seller</Link>
      </div>
    </main>
  )
}
