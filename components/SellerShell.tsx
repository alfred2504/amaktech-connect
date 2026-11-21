import Link from 'next/link'

export function SellerShell({
  eyebrow = 'Seller workspace',
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-container admin-nav">
          <Link className="admin-logo" href="/">
            <span>AmakTech</span> <b>Connect</b>
          </Link>
          <nav aria-label="Seller navigation">
            <Link href="/seller/dashboard">Overview</Link>
            <Link href="/seller/products">Products</Link>
            <Link href="/seller/orders">Orders</Link>
            <Link href="/seller/fulfillments">Fulfillment</Link>
            <Link href="/seller/store">Store profile</Link>
            <Link href="/seller/payouts">Payouts</Link>
            <Link href="/">Storefront</Link>
            <Link className="admin-logout" href="/logout">Log out</Link>
          </nav>
        </div>
      </header>
      <div className="admin-container admin-content">
        <div className="admin-intro">
          <div>
            <p className="admin-kicker">{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}
