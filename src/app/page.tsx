import { prisma } from "@/lib/prima";
import Image from "next/image";
import Link from "next/link";

async function getHomePageData() {
	try {
		// Fetch featured products with images and reviews
		const products = await prisma.product.findMany({
			where: { isActive: true, deletedAt: null },
			include: {
				images: { where: { isPrimary: true } },
				reviews: true,
				category: true,
				inventory: true,
			},
			take: 8,
			orderBy: { createdAt: "desc" },
		});

		// Fetch new arrivals
		const newArrivals = await prisma.product.findMany({
			where: { isActive: true, deletedAt: null },
			include: {
				images: { where: { isPrimary: true } },
				reviews: true,
				category: true,
			},
			take: 4,
			orderBy: { createdAt: "desc" },
		});

		// Fetch top selling products (by review count)
		const topSelling = await prisma.product.findMany({
			where: { isActive: true, deletedAt: null },
			include: {
				images: { where: { isPrimary: true } },
				reviews: true,
				category: true,
			},
			take: 4,
			orderBy: { reviews: { _count: "desc" } },
		});

		// Fetch all categories for broad product discovery
		const allCategories = await prisma.category.findMany({
			where: { deletedAt: null, parentId: null },
			take: 8,
		});

		// Fetch categories for hero
		const categories = await prisma.category.findMany({
			where: { deletedAt: null, parentId: null },
			take: 5,
		});

		// Fetch top reviews for testimonials
		const reviews = await prisma.review.findMany({
			where: { deletedAt: null },
			include: {
				product: true,
				user: true,
			},
			take: 6,
			orderBy: { createdAt: "desc" },
		});

		// Fetch brands
		const brands = await prisma.brand.findMany({
			where: { deletedAt: null },
			take: 6,
		});

		// Count stats
		const [totalBrands, totalProducts, totalUsers] = await Promise.all([
			prisma.brand.count({ where: { deletedAt: null } }),
			prisma.product.count({ where: { deletedAt: null } }),
			prisma.user.count(),
		]);

		return { products, newArrivals, topSelling, categories, allCategories, brands, reviews, totalBrands, totalProducts, totalUsers };
	} catch (error) {
		console.error("Error fetching homepage data:", error);
		return { products: [], newArrivals: [], topSelling: [], categories: [], allCategories: [], brands: [], reviews: [], totalBrands: 0, totalProducts: 0, totalUsers: 0 };
	}
}

function getRating(reviews: Array<{ rating: number | null }>) {
	if (reviews.length === 0) return "0";
	const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
	return (total / reviews.length).toFixed(1);
}

function renderStars(rating: string | number) {
	const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
	const fullStars = Math.floor(numRating);
	return (
		<div className="flex gap-0.5">
			{[...Array(5)].map((_, i) => (
				<span key={i} className={i < fullStars ? "text-yellow-500" : "text-slate-300"}>
					★
				</span>
			))}
		</div>
	);
}

export default async function HomePage() {
	const { products, newArrivals, topSelling, categories, allCategories, brands, reviews, totalBrands, totalProducts, totalUsers } = await getHomePageData();

	return (
		<main className="min-h-screen bg-white">
			{/* Top Banner */}
			<div className="bg-black text-white text-center py-3 text-sm font-medium">
				Sign up and get 20% off your order.{" "}
				<Link href="/register" className="underline hover:text-yellow-300 font-bold">
					Sign Up Now
				</Link>
			</div>

			{/* Header Navigation */}
			<header className="sticky top-0 z-40 bg-white border-b border-slate-200">
				<div className="mx-auto max-w-7xl px-6 py-5">
					<div className="flex items-center justify-between gap-8">
						<Link href="/" className="text-3xl font-black">
							<span className="text-green-700">AMAKTECH</span>
							<span className="text-yellow-400"> CONNECT</span>
						</Link>

						{/* Navigation Links */}
						<nav className="hidden md:flex items-center gap-10">
							<Link href="/shop" className="text-slate-700 hover:text-green-700 font-semibold text-sm transition">
								Shop
							</Link>
							<Link href="/shop" className="text-slate-700 hover:text-green-700 font-semibold text-sm transition">
								On Sale
							</Link>
							<Link href="/shop" className="text-slate-700 hover:text-green-700 font-semibold text-sm transition">
								New Arrivals
							</Link>
							<Link href="/shop" className="text-slate-700 hover:text-green-700 font-semibold text-sm transition">
								Brands
							</Link>
						</nav>

						{/* Right Actions */}
						<div className="flex items-center gap-6">
							<input
								type="search"
								placeholder="Search products..."
								className="hidden sm:block px-4 py-2.5 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-green-700 w-56"
							/>
							<Link href="/shop" className="text-slate-700 hover:text-green-700 text-2xl transition">
								🛒
							</Link>
							<Link href="/dashboard" className="text-slate-700 hover:text-green-700 text-2xl transition">
								👤
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="bg-gradient-to-r from-slate-100 to-slate-50 py-20 md:py-32">
				<div className="mx-auto max-w-7xl px-6">
					<div className="grid md:grid-cols-2 gap-16 items-center">
						{/* Left - Content */}
						<div className="space-y-8">
							<div className="space-y-4">
								<h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-tight">
									FIND EVERYTHING
									<br />
									<span className="text-green-700">YOU NEED</span>
									<br />
									IN ONE PLACE
								</h1>
								<p className="text-slate-600 text-lg leading-relaxed max-w-lg">
									Browse a wide range of quality products for every part of life, from everyday essentials to the things you love, all at great prices.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Link
									href="/shop"
									className="inline-flex items-center justify-center bg-black text-white px-10 py-4 rounded-lg font-bold hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg"
								>
									Shop Now
								</Link>
								<Link
									href="/login"
									className="inline-flex items-center justify-center border-2 border-slate-400 text-slate-900 px-10 py-4 rounded-lg font-bold hover:bg-slate-100 transition-all"
								>
									Sign In
								</Link>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-3 gap-8 pt-8 border-t-2 border-slate-300">
								<div>
									<p className="text-4xl font-black text-green-700">{totalBrands}+</p>
									<p className="text-sm text-slate-600 font-medium">Brands</p>
								</div>
								<div>
									<p className="text-4xl font-black text-yellow-500">{totalProducts.toLocaleString()}+</p>
									<p className="text-sm text-slate-600 font-medium">Products</p>
								</div>
								<div>
									<p className="text-4xl font-black text-green-700">{totalUsers}K+</p>
									<p className="text-sm text-slate-600 font-medium">Customers</p>
								</div>
							</div>
						</div>

						{/* Right - Visual */}
						<div className="hidden md:block">
							<div className="grid grid-cols-2 gap-4 h-full">
								<div className="bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl aspect-square flex items-center justify-center text-8xl transform hover:scale-110 transition-transform">
									🛍️
								</div>
								<div className="bg-gradient-to-br from-green-200 to-green-100 rounded-2xl aspect-square flex items-center justify-center text-8xl transform hover:scale-110 transition-transform">
									📱
								</div>
								<div className="bg-gradient-to-br from-emerald-200 to-emerald-100 rounded-2xl aspect-square flex items-center justify-center text-8xl transform hover:scale-110 transition-transform">
									🏠
								</div>
								<div className="bg-gradient-to-br from-blue-200 to-blue-100 rounded-2xl aspect-square flex items-center justify-center text-8xl transform hover:scale-110 transition-transform">
									🎧
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Category Filter Section */}
			<section className="bg-slate-50 py-8 border-b border-slate-200">
				<div className="mx-auto max-w-7xl px-6">
					<div className="flex flex-wrap gap-3 items-center">
						<span className="font-bold text-slate-900 text-sm">FILTER BY:</span>
						<Link
							href="/shop"
							className="px-6 py-2.5 rounded-full bg-white border-2 border-slate-300 text-slate-700 hover:bg-green-50 hover:border-green-700 transition-all font-bold text-sm"
						>
							All
						</Link>
						{categories.slice(0, 4).map((category, index) => (
							<a
								key={category.id}
								href={`/shop?category=${category.slug}`}
								className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
									index === 0
										? "bg-green-700 text-white"
										: "bg-white border-2 border-slate-300 text-slate-700 hover:bg-green-50 hover:border-green-700"
								}`}
							>
								{category.name}
							</a>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products Grid */}
			<section className="py-20">
				<div className="mx-auto max-w-7xl px-6">
					<h2 className="text-4xl font-black text-slate-900 mb-12">FEATURED PRODUCTS</h2>

					{products.length > 0 ? (
						<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{products.map((product) => {
								const rating = getRating(product.reviews);
								const image = product.images?.[0];

								return (
									<a
										key={product.id}
										href={`/shop/${product.slug}`}
										className="group"
									>
										<div className="relative mb-5 overflow-hidden rounded-2xl bg-slate-200 aspect-square">
											{image?.url ? (
												<Image
													src={image.url}
													alt={product.name}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-300"
												/>
											) : (
												<div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
													<span className="text-6xl">📦</span>
												</div>
											)}
											<button className="absolute top-4 right-4 bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg hover:bg-red-50">
												❤️
											</button>
										</div>
										<div className="space-y-2">
											<h3 className="font-bold text-slate-900 line-clamp-2 text-sm">{product.name}</h3>
											<p className="text-xs text-slate-600 uppercase font-semibold">{product.category.name}</p>
											<div className="flex items-center gap-2">
												<div className="flex gap-0.5">
													{renderStars(rating)}
												</div>
												<span className="text-xs text-slate-500">({product.reviews.length})</span>
											</div>
											<div className="flex items-center gap-2 pt-1">
												<p className="font-black text-slate-900 text-lg">${product.price.toFixed(2)}</p>
												{product.compareAtPrice && (
													<p className="text-xs text-slate-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
												)}
											</div>
										</div>
									</a>
								);
							})}
						</div>
					) : (
						<div className="text-center py-20">
							<p className="text-slate-600 text-lg">No products available yet.</p>
						</div>
					)}
				</div>
			</section>

			{/* Brands Section */}
			{brands.length > 0 && (
				<section className="bg-slate-900 text-white py-8 border-t border-slate-200">
					<div className="mx-auto max-w-7xl px-6">
						<p className="text-center text-sm text-slate-400 mb-4">Shop from premium brands</p>
						<div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
							{brands.map((brand) => (
								<Link
									key={brand.id}
									href={`/shop?brand=${brand.slug}`}
									className="font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
								>
									{brand.name}
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* New Arrivals Section */}
			<section className="py-20 border-b border-slate-200 bg-slate-50">
				<div className="mx-auto max-w-7xl px-6">
					<h2 className="text-4xl font-black text-slate-900 mb-12">NEW ARRIVALS</h2>
					{newArrivals.length > 0 ? (
						<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{newArrivals.map((product) => {
								const rating = getRating(product.reviews);
								const image = product.images?.[0];

								return (
									<a key={product.id} href={`/shop/${product.slug}`} className="group">
										<div className="relative mb-5 overflow-hidden rounded-2xl bg-slate-200 aspect-square">
											{image?.url ? (
												<Image
													src={image.url}
													alt={product.name}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-300"
												/>
											) : (
												<div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
													<span className="text-6xl">📦</span>
												</div>
											)}
											<button className="absolute top-4 right-4 bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg hover:bg-red-50">
												❤️
											</button>
										</div>
										<div className="space-y-2">
											<h3 className="font-bold text-slate-900 line-clamp-2 text-sm">{product.name}</h3>
											<p className="text-xs text-slate-600 uppercase font-semibold">{product.category.name}</p>
											<div className="flex items-center gap-2">
												<div className="flex gap-0.5">{renderStars(rating)}</div>
												<span className="text-xs text-slate-500">({product.reviews.length})</span>
											</div>
											<div className="flex items-center gap-2 pt-1">
												<p className="font-black text-slate-900 text-lg">${product.price.toFixed(2)}</p>
												{product.compareAtPrice && (
													<p className="text-xs text-slate-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
												)}
											</div>
										</div>
									</a>
								);
							})}
						</div>
					) : null}
				</div>
			</section>

			{/* Top Selling Section */}
			<section className="py-20 border-b border-slate-200">
				<div className="mx-auto max-w-7xl px-6">
					<h2 className="text-4xl font-black text-slate-900 mb-12">TOP SELLING</h2>
					{topSelling.length > 0 ? (
						<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{topSelling.map((product) => {
								const rating = getRating(product.reviews);
								const image = product.images?.[0];

								return (
									<a key={product.id} href={`/shop/${product.slug}`} className="group">
										<div className="relative mb-5 overflow-hidden rounded-2xl bg-slate-200 aspect-square">
											{image?.url ? (
												<Image
													src={image.url}
													alt={product.name}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-300"
												/>
											) : (
												<div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
													<span className="text-6xl">📦</span>
												</div>
											)}
											<button className="absolute top-4 right-4 bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg hover:bg-red-50">
												❤️
											</button>
										</div>
										<div className="space-y-2">
											<h3 className="font-bold text-slate-900 line-clamp-2 text-sm">{product.name}</h3>
											<p className="text-xs text-slate-600 uppercase font-semibold">{product.category.name}</p>
											<div className="flex items-center gap-2">
												<div className="flex gap-0.5">{renderStars(rating)}</div>
												<span className="text-xs text-slate-500">({product.reviews.length})</span>
											</div>
											<div className="flex items-center gap-2 pt-1">
												<p className="font-black text-slate-900 text-lg">${product.price.toFixed(2)}</p>
												{product.compareAtPrice && (
													<p className="text-xs text-slate-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
												)}
											</div>
										</div>
									</a>
								);
							})}
						</div>
					) : null}
				</div>
			</section>

			{/* Browse By Category Section */}
			{allCategories.length > 0 && (
				<section className="py-20 border-b border-slate-200 bg-slate-50">
					<div className="mx-auto max-w-7xl px-6">
						<h2 className="text-4xl font-black text-slate-900 mb-12">BROWSE BY CATEGORY</h2>
						<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{allCategories.map((category, index) => (
								<a
									key={category.id}
									href={`/shop?category=${category.slug}`}
									className="group relative overflow-hidden rounded-2xl aspect-square flex items-center justify-center"
								>
									<div
										className={`absolute inset-0 group-hover:scale-110 transition-transform duration-300 ${
											index % 4 === 0
												? "bg-gradient-to-br from-yellow-200 to-yellow-100"
												: index % 4 === 1
													? "bg-gradient-to-br from-green-200 to-green-100"
													: index % 4 === 2
														? "bg-gradient-to-br from-emerald-200 to-emerald-100"
														: "bg-gradient-to-br from-blue-200 to-blue-100"
										}`}
									/>
									{category.image && (
										<Image
											src={category.image}
											alt={category.name}
											fill
											unoptimized
											sizes="(max-width: 768px) 50vw, 25vw"
											className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
										/>
									)}
									<div className="relative z-10 text-center">
										<h3 className="text-2xl font-black text-slate-900">{category.name}</h3>
									</div>
								</a>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Our Happy Customers / Reviews Section */}
			{reviews.length > 0 && (
				<section className="py-20 border-b border-slate-200">
					<div className="mx-auto max-w-7xl px-6">
						<h2 className="text-4xl font-black text-slate-900 mb-12">OUR HAPPY CUSTOMERS</h2>
						<div className="grid md:grid-cols-3 gap-6">
							{reviews.map((review) => (
								<div
									key={review.id}
									className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow"
								>
									<div className="flex gap-1 mb-3">
										{renderStars(review.rating || 5)}
									</div>
									<div className="flex items-center gap-2 mb-3">
										<p className="font-bold text-slate-900 text-sm">{review.user?.name || "Anonymous"}</p>
										<span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-bold">✓ Verified</span>
									</div>
									<p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
											&quot;{review.comment || "Great product!"}&quot;
									</p>
									{review.product && (
										<p className="text-xs text-slate-500 font-semibold">
											Posted on {new Date(review.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Newsletter CTA Section */}
			<section className="bg-black text-white py-20">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<h2 className="text-4xl md:text-5xl font-black mb-4">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
					<div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mt-8">
						<input
							type="email"
							placeholder="Enter your email address"
							className="px-6 py-4 rounded-lg text-slate-900 font-semibold focus:outline-none flex-1"
						/>
						<button className="bg-white text-black px-8 py-4 rounded-lg font-black hover:bg-slate-100 transition-all transform hover:scale-105">
							Subscribe
						</button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
				<div className="mx-auto max-w-7xl px-6">
					<div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
						{/* Company Info */}
						<div>
							<h3 className="text-white font-black mb-4 text-lg">AMAKTECH CONNECT</h3>
							<p className="text-sm leading-relaxed">Discover quality products across categories, thoughtfully brought together for everyday life.</p>
						</div>

						{/* Company */}
						<div>
							<h3 className="text-white font-bold mb-4 uppercase text-sm">COMPANY</h3>
							<ul className="space-y-3 text-sm">
								<li><a href="#" className="hover:text-white transition font-medium">About</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Careers</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Blog</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Press</a></li>
							</ul>
						</div>

						{/* Help */}
						<div>
							<h3 className="text-white font-bold mb-4 uppercase text-sm">HELP</h3>
							<ul className="space-y-3 text-sm">
								<li><a href="#" className="hover:text-white transition font-medium">Customer Support</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Track Order</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Returns</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">FAQ</a></li>
							</ul>
						</div>

						{/* FAQ */}
						<div>
							<h3 className="text-white font-bold mb-4 uppercase text-sm">FAQ</h3>
							<ul className="space-y-3 text-sm">
								<li><a href="#" className="hover:text-white transition font-medium">Shipping Policy</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Privacy Policy</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Terms & Conditions</a></li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h3 className="text-white font-bold mb-4 uppercase text-sm">RESOURCES</h3>
							<ul className="space-y-3 text-sm">
								<li><a href="#" className="hover:text-white transition font-medium">Free eBooks</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Development</a></li>
								<li><a href="#" className="hover:text-white transition font-medium">Analytics</a></li>
							</ul>
						</div>
					</div>

					{/* Footer Bottom */}
					<div className="border-t border-slate-800 pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center gap-6">
							<p className="text-sm font-semibold">© 2024 AmakTech Connect. All rights reserved.</p>
							<div className="flex gap-4">
								<a href="#" className="text-lg hover:text-white transition">📘</a>
								<a href="#" className="text-lg hover:text-white transition">🐦</a>
								<a href="#" className="text-lg hover:text-white transition">📷</a>
								<a href="#" className="text-lg hover:text-white transition">🎬</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
