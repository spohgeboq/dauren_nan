import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: { email: 'admin@admin.com', passwordHash: pass, login: 'admin', role: 'ADMIN', name: 'admin' }
  });
  console.log('done');
}
main();
