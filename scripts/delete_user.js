/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'prayernetworkeipn2020@gmail.com';
  try {
    // Delete related records first (verification tokens, password reset tokens)
    await prisma.verificationToken.deleteMany({
      where: { user: { email } },
    });
    console.log('Deleted verification tokens');

    await prisma.passwordResetToken.deleteMany({
      where: { user: { email } },
    });
    console.log('Deleted password reset tokens');

    // Now delete the user
    const deleted = await prisma.user.delete({
      where: { email },
    });
    console.log('Account deleted successfully:');
    console.log('  Email:', deleted.email);
    console.log('  Name:', deleted.name);
    console.log('  ID:', deleted.id);
  } catch (err) {
    console.error('Delete error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
