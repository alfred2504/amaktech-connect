/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'inforamaiv@gmail.com';
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    console.log('Updated user:', user.email, user.id, 'emailVerified=', user.emailVerified);
  } catch (err) {
    console.error('Update error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
