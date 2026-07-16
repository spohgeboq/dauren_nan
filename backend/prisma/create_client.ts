import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function run() {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash('client12', 10);
  
  // Создаем магазин если его нет
  let client = await prisma.client.findFirst();
  if (!client) {
    client = await prisma.client.create({
      data: { name: 'Тестовый Магазин', type: 'Магазин у дома', phone: '+77777777777' }
    });
  }

  const user = await prisma.user.upsert({
    where: { email: 'client@gmail.com' },
    update: {},
    create: {
      email: 'client@gmail.com',
      passwordHash: hash,
      name: 'Тестовый Клиент (Магазин)',
      login: 'client',
      role: 'CLIENT',
      status: 'ACTIVE',
      isOnShift: false,
      clientId: client.id
    },
  });
  console.log('Client user created:', user.email);
  await prisma.$disconnect();
}
run();
