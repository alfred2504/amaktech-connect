import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { money } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const fallbackSettings = {
	site_name: 'AmakTech Connect',
	logo_url: '',
	hero_title: 'Everything your world needs, connected in one place',
	hero_description: 'Explore a diverse marketplace of quality electronics, home essentials, lifestyle products, and more, all brought together by AmakTech Connect.',
	primary_color: '#050505',
	accent_color: '#f6c900',
	background_color: '#f5f2f3',
	brand_color: '#319b19',
	stat_brands: '200+',
	stat_products: '2,000+',
	stat_customers: '30,000+',
}

type LandingProduct = Prisma.ProductGetPayload<{
	include: { images: true; brand: true }
}>

export default async function Home() {
	let products: LandingProduct[] = []
	let settings: Array<{ key: string; value: string }> = []

	try {
		[products, settings] = await Promise.all([
			prisma.product.findMany({
				where: { isActive: true, deletedAt: null },
				include: { images: true, brand: true },
				take: 8,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.$queryRawUnsafe<Array<{ key: string; value: string }>>(
				'SELECT key, value FROM public."Setting" WHERE "deletedAt" IS NULL',
			),
		])
	} catch (error) {
		console.error('Failed to load landing page data:', error)
	}

	const siteSettings = settings.reduce<Record<string, string>>(
		(values, setting) => ({ ...values, [setting.key]: setting.value }),
		fallbackSettings,
	)

	return (
		<>
			<header className="store-header">
				<div className="container nav-row">
					<Link className="wordmark" href="/" aria-label={siteSettings.site_name}>
						{siteSettings.logo_url ? (
							<img src={siteSettings.logo_url} alt={siteSettings.site_name} />
						) : (
							<span><em>AmakTech</em> <strong>Connect</strong></span>
						)}
					</Link>
					<nav className="main-nav" aria-label="Main navigation">
						<Link href="/products">Shop <span aria-hidden="true">⌄</span></Link>
						<Link href="/products?q=sale">On Sale</Link>
						<Link href="/products">New Arrivals</Link>
						<Link href="/products">Brands</Link>
					</nav>
					<form className="site-search" action="/products">
						<span aria-hidden="true">⌕</span>
						<input name="q" placeholder="Search for products..." aria-label="Search products" />
					</form>
					<div className="nav-actions">
						<Link href="/cart" aria-label="Shopping cart">🛒</Link>
						<Link href="/account" aria-label="Account">◉</Link>
					</div>
					<div className="auth-actions">
						<Link href="/login">Sign in</Link>
						<Link className="signup-link" href="/register">Create account</Link>
					</div>
				</div>
			</header>

			<section
				className="landing-hero"
				style={{
					'--hero-bg': siteSettings.background_color,
					'--hero-accent': siteSettings.accent_color,
					'--hero-brand': siteSettings.brand_color,
				} as React.CSSProperties}
			>
				<div className="container hero-grid">
					<div className="hero-copy">
						<p className="eyebrow">{siteSettings.site_name}</p>
						<h1>{siteSettings.hero_title}</h1>
						<p className="hero-description">{siteSettings.hero_description}</p>
						<Link className="shop-button" href="/products">Shop now</Link>
						<div className="stats" aria-label="Store statistics">
							<div><strong>{siteSettings.stat_brands}</strong><span>International Brands</span></div>
							<div><strong>{siteSettings.stat_products}</strong><span>High-Quality Products</span></div>
							<div><strong>{siteSettings.stat_customers}</strong><span>Happy Customers</span></div>
						</div>
					</div>
					<div className="hero-art" aria-label="Featured collection">
							{siteSettings.logo_url ? <img src={siteSettings.logo_url} alt="" /> : <span><em>AmakTech</em><strong>Connect</strong></span>}
						<i className="spark spark-one" aria-hidden="true">✦</i>
						<i className="spark spark-two" aria-hidden="true">✦</i>
					</div>
				</div>
			</section>

			<main className="container products-section">
				<div className="section-heading"><p className="eyebrow">Curated for you</p><h2>Featured products</h2><Link href="/products">View all</Link></div>
				<div className="product-grid">
					{products.map((product) => (
						<Link className="product-card" href={`/products/${product.slug}`} key={product.id}>
							{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].altText || product.name} /> : <div className="product-placeholder" />}
							<div className="product-info"><h3>{product.name}</h3><span>{product.brand?.name || siteSettings.site_name}</span><strong>{money(product.price)}</strong></div>
						</Link>
					))}
				</div>
			</main>
			<style>{`
				:root { --ink: ${siteSettings.primary_color}; --gold: ${siteSettings.accent_color}; --green: ${siteSettings.brand_color}; }
				* { box-sizing: border-box; }
				body { margin: 0; color: var(--ink); font-family: Arial, Helvetica, sans-serif; }
				a { color: inherit; text-decoration: none; }
				.container { width: min(1440px, calc(100% - 48px)); margin: 0 auto; }
				.store-header { background: #fff; border-top: 6px solid var(--ink); }
				.nav-row { min-height: 112px; display: flex; align-items: center; gap: 42px; }
				.wordmark { font-size: 35px; font-weight: 950; letter-spacing: -2px; white-space: nowrap; }.wordmark em { color: var(--green); font-style: normal; }.wordmark strong { color: var(--gold); }
				.wordmark img { display: block; max-width: 190px; max-height: 58px; object-fit: contain; }
				.main-nav { display: flex; gap: 28px; font-size: 17px; white-space: nowrap; }
				.main-nav a:hover, .section-heading a:hover { color: var(--green); }
				.site-search { flex: 1; max-width: 620px; background: #f0eeee; border-radius: 40px; display: flex; align-items: center; gap: 12px; padding: 0 22px; color: #858282; }
				.site-search span { font-size: 31px; line-height: 1; transform: rotate(-20deg); }
				.site-search input { width: 100%; border: 0; outline: 0; background: transparent; padding: 16px 0; font-size: 16px; }
				.nav-actions { display: flex; gap: 22px; font-size: 25px; margin-left: auto; }
				.auth-actions { display: flex; align-items: center; gap: 14px; white-space: nowrap; font-size: 14px; font-weight: 700; }
				.auth-actions > a:first-child { color: var(--green); }.auth-actions > a:first-child:hover { color: var(--ink); }
				.signup-link { background: var(--gold); border-radius: 999px; padding: 12px 18px; }.signup-link:hover { background: var(--green); color: #fff; }
				.landing-hero { background: var(--hero-bg); overflow: hidden; }
				.hero-grid { min-height: 650px; display: grid; grid-template-columns: .92fr 1.08fr; align-items: center; }
				.hero-copy { padding: 60px 0 45px; position: relative; z-index: 1; }
				.eyebrow { color: var(--hero-brand, var(--green)); font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 18px; }
				.hero-copy h1 { max-width: 690px; margin: 0; font-size: clamp(52px, 5.5vw, 86px); line-height: .94; letter-spacing: -4px; text-transform: uppercase; font-weight: 950; }
				.hero-description { max-width: 610px; color: #686466; font-size: 18px; line-height: 1.45; margin: 30px 0; }
				.shop-button { display: inline-block; background: var(--ink); color: #fff; border-radius: 999px; padding: 17px 66px; font-size: 16px; font-weight: 700; }
				.shop-button:hover { background: var(--hero-brand, var(--green)); }
				.stats { display: flex; margin-top: 55px; }
				.stats div { min-width: 190px; padding: 0 35px; border-right: 1px solid #d4d0d1; display: flex; flex-direction: column; gap: 7px; }
				.stats div:first-child { padding-left: 0; }
				.stats div:last-child { border: 0; }
				.stats strong { font-size: 40px; letter-spacing: -2px; }
				.stats span { color: #6d696b; font-size: 14px; }
				.hero-art { min-height: 650px; position: relative; display: flex; align-items: center; justify-content: center; }
				.hero-art:before { content: ''; width: min(510px, 80%); height: 510px; border-radius: 50% 50% 8% 8%; background: var(--hero-brand, var(--green)); opacity: .13; position: absolute; bottom: -90px; }
				.hero-art img { position: relative; max-width: 85%; max-height: 460px; object-fit: contain; mix-blend-mode: multiply; }
				.hero-art > span { position: relative; max-width: 450px; font-size: clamp(55px, 8vw, 120px); line-height: .8; font-weight: 950; text-align: center; text-transform: uppercase; }.hero-art > span em { color: var(--hero-brand, var(--green)); font-style: normal; display: block; }.hero-art > span strong { color: var(--hero-accent, var(--gold)); display: block; }
				.spark { position: absolute; color: var(--hero-accent, var(--gold)); font-style: normal; font-size: 75px; }
				.spark-one { top: 18%; right: 8%; }.spark-two { bottom: 21%; left: 10%; font-size: 48px; }
				.products-section { padding: 76px 0; }
				.section-heading { display: flex; align-items: end; gap: 22px; margin-bottom: 28px; }.section-heading .eyebrow { margin: 0 auto 0 0; }.section-heading h2 { margin: 0; font-size: 38px; }.section-heading a { font-weight: 700; border-bottom: 2px solid var(--gold); }
				.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }.product-card { min-width: 0; }.product-card img, .product-placeholder { width: 100%; aspect-ratio: 1 / 1.12; object-fit: cover; background: #f1eeee; border-radius: 18px; }.product-info { display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; padding-top: 14px; }.product-info h3 { margin: 0; font-size: 17px; grid-column: 1 / -1; }.product-info span { color: #777; font-size: 14px; }.product-info strong { font-size: 16px; }
				@media (max-width: 900px) { .nav-row { gap: 20px; flex-wrap: wrap; padding: 20px 0; }.main-nav { order: 3; width: 100%; justify-content: space-between; gap: 12px; font-size: 14px; }.site-search { order: 2; }.auth-actions { margin-left: auto; }.hero-grid { grid-template-columns: 1fr; }.hero-art { min-height: 270px; }.hero-art img { max-height: 240px; }.hero-copy { padding-bottom: 0; }.product-grid { grid-template-columns: repeat(2, 1fr); } }
				@media (max-width: 560px) { .container { width: min(100% - 28px, 1440px); }.wordmark { font-size: 28px; }.nav-actions { font-size: 21px; gap: 12px; }.auth-actions { width: 100%; justify-content: space-between; order: 4; border-top: 1px solid #e4e0e1; padding-top: 14px; }.hero-copy h1 { font-size: 48px; letter-spacing: -2px; }.stats { flex-wrap: wrap; gap: 18px 0; margin-top: 38px; }.stats div { min-width: 50%; padding: 0 12px; }.stats div:nth-child(3) { padding-left: 0; }.stats strong { font-size: 28px; }.section-heading { display: block; }.section-heading h2 { margin: 8px 0 14px; }.product-grid { gap: 14px; }.product-info h3 { font-size: 15px; } }
			`}</style>
		</>
	)
}
