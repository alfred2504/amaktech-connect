# Production checklist

- Rotate any credentials previously pasted into chat/terminals.
- Configure Supabase Storage bucket `products` as appropriate.
- Use `DATABASE_URL` on transaction pooler 6543 for app runtime and `DIRECT_URL` on session/direct 5432 for Prisma migrations.
- Do not reset production DB. Establish/inspect migration history before deploying schema changes.
- Add verified payment gateway webhooks before accepting online payments.
- Configure email verification/password reset with Resend.
- Add rate limiting, CAPTCHA where needed, security headers, monitoring, backups and CI.
- Add vendor/store models before enabling multi-vendor sales.
