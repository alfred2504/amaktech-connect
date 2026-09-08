import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL
const datasourceUrl = databaseUrl
  ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}connection_limit=1`
  : undefined

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  datasourceUrl
    ? { datasources: { db: { url: datasourceUrl } } }
    : undefined,
)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma