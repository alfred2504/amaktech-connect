/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'prayernetworkeipn2020@gmail.com';
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (user) {
      console.log('Account found:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  ID:', user.id);
      console.log('  Role:', user.role?.name);
      console.log('  Active:', user.isActive);
      console.log('  Email Verified:', user.emailVerified);
      console.log('  Created:', user.createdAt);
    } else {
      console.log('Account NOT found in system:', email);
    }
  } catch (err) {
    console.error('Query error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
