export default function HomePage() {
	return (
		<main className="min-h-screen bg-white">
			<section className="mx-auto flex min-h-screen max-w-7xl items-center px-6">
				<div>
					<p className="mb-3 font-semibold text-blue-600">AmakTech Connect</p>

					<h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
						Connecting Businesses,
						<br />
						Empowering Commerce.
					</h1>

					<p className="mt-6 max-w-2xl text-lg text-slate-600">
						A modern e-commerce platform connecting businesses
						and customers through a trusted digital marketplace.
					</p>

					<div className="mt-8 flex gap-4">
						<a
							href="/register"
							className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
						>
							Get Started
						</a>

						<a
							href="/login"
							className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
						>
							Sign In
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}
