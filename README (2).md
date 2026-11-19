# AmakTech Connect
A Next.js full-stack marketplace starter using AmakTech green/gold branding. The catalog is database-driven; the starter seeds categories only and does not ship a hardcoded product catalog.

## Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase PostgreSQL works)

## Setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `ADMIN_API_TOKEN`.
2. Install: `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Apply schema: `npx prisma db push` (or use `npm run db:migrate` for migrations)
5. Seed categories: `npm run db:seed`
6. Run locally: `npm run dev`
7. Visit `http://localhost:3000`; admin catalog management is at `/admin`.

## Included functionality
- Responsive storefront and category navigation
- DB-driven category/product listing and search
- Category filter and sort controls
- Dynamic product detail pages
- Local-storage cart with quantity/removal controls
- Prisma PostgreSQL schema and category seed
- Token-protected category and product creation API routes
- Admin UI for adding categories and products

## API
- `GET /api/categories`
- `GET /api/products?q=search&category=slug`
- `POST /api/admin/categories` (header `x-admin-token`)
- `POST /api/admin/products` (header `x-admin-token`)

## Important implementation status
This is a working project foundation, not a production-ready marketplace. Authentication, seller onboarding and dashboards, order management, payment-provider integrations, shipping calculations, reviews, refund workflows, image-upload service, inventory reservations, and checkout are not implemented yet. Checkout in the cart currently displays an explicit not-enabled notice. Before production, replace the simple admin token with proper authenticated roles, validate and rate-limit all API routes, review security, configure storage, and complete payment integrations.
