import { loadEnvConfig } from '@next/env'
import { SUPER_ADMIN_EMAIL } from '../lib/admin-constants'

async function main() {
  loadEnvConfig(process.cwd())
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('Set DIRECT_URL or DATABASE_URL before promoting the super administrator.')
  }

  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })

  try {
    const user = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
      select: { id: true, role: true },
    })

    if (!user) {
      throw new Error(`No account exists for ${SUPER_ADMIN_EMAIL}. Register that account, then run this command again.`)
    }

    if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      })
    }

    console.log(`${SUPER_ADMIN_EMAIL} is now an administrator with super-administrator access.`)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(error => {
    console.error('Unable to promote the super administrator:', error)
    process.exitCode = 1
  })
