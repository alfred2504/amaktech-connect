import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type = 'GENERAL',
  metadata?: Prisma.InputJsonValue,
) {
  return prisma.notification.create({
    data: { userId, title, message, type, metadata },
  })
}
