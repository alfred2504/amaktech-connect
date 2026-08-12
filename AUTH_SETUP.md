# AmakTech Connect — Sprint 1.2

Install:
npm install next-auth@beta bcryptjs zod

Configure `.env`:
DATABASE_URL="..."
DIRECT_URL="..."
AUTH_SECRET="..."

Then:
npx prisma generate
npx prisma migrate dev --name auth-foundation
npx prisma db seed
npm run dev

Test:
http://localhost:3000/register
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin

Review the schema before applying it to an existing database. Do not overwrite an existing production database.