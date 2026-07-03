require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Передаем непустой объект конфигурации, как требует Prisma v7
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@gmail.com';
  const plainPassword = 'admin12';

  // Проверяем, существует ли уже такой пользователь
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Администратор уже существует!');
    return;
  }

  // Шифруем пароль
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  // Создаем админа в базе данных
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: passwordHash,
      name: 'Главный Администратор',
      role: 'ADMIN' // Назначаем максимальные права
    }
  });

  console.log('Пользователь-админ успешно создан:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
