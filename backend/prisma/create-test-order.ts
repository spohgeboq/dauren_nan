import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Создание тестовых данных...');

  // 1. Создаем клиента (Магазин)
  const clientUser = await prisma.user.upsert({
    where: { login: 'client1' },
    update: {},
    create: {
      email: 'client@magazin.kz',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Владелец Магазина Аида',
      phone: '+7 701 111 2233',
      login: 'client1',
      role: Role.CLIENT,
    }
  });

  const clientStore = await prisma.client.create({
    data: {
      name: 'Магазин Аида',
      type: 'Магазин у дома',
      ownerName: 'Владелец Магазина Аида',
      phone: '+7 701 111 2233',
      address: 'ул. Абая 10, Алматы',
      user: { connect: { id: clientUser.id } }
    } as any // Временно кастуем если схема отличается
  }).catch(async (e) => {
    // Если поле address нет в схеме:
    console.log("Creating client without address field...");
    return prisma.client.create({
      data: {
        name: 'Магазин Аида',
        type: 'Магазин у дома',
        phone: '+7 701 111 2233',
        user: { connect: { id: clientUser.id } }
      }
    });
  });

  // 2. Находим водителя (Азамат)
  const driver = await prisma.user.findFirst({ where: { login: 'azamat_drv' } });
  if (!driver) throw new Error("Driver azamat_drv not found");

  // 3. Создаем продукт (Батон и Лепешка)
  const category = await prisma.category.findFirst() || await prisma.category.create({ data: { name: 'Хлеб' } });
  
  const product1 = await prisma.product.findFirst({ where: { name: 'Батон' } }) || await prisma.product.create({
    data: { name: 'Батон', sku: 'B1', price: 150, categoryId: category.id }
  });
  
  const product2 = await prisma.product.findFirst({ where: { name: 'Лепешка' } }) || await prisma.product.create({
    data: { name: 'Лепешка', sku: 'L1', price: 180, categoryId: category.id }
  });

  // 4. Создаем DeliveryOrder
  const order = await prisma.deliveryOrder.create({
    data: {
      clientName: 'Магазин Аида',
      clientPhone: '+7 701 111 2233',
      address: 'ул. Абая 10, Алматы',
      status: 'PENDING',
      totalAmount: 150*20 + 180*40,
      driverId: driver.id,
      clientId: clientStore.id,
      items: {
        create: [
          { productId: product1.id, quantity: 20, price: 150 },
          { productId: product2.id, quantity: 40, price: 180 }
        ]
      }
    }
  });

  console.log('Данные успешно созданы!');
  console.log(`Курьер для входа: Логин: azamat_drv, Пароль: password123`);
  console.log(`Клиент для входа: Логин: client1, Пароль: password123`);
  console.log(`Заказ ID: ${order.id}`);
}

main().finally(() => prisma.$disconnect());
