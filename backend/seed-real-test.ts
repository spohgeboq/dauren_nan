import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Очистка старых тестовых данных...');
  await prisma.deliveryOrderItem.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.client.deleteMany({ where: { name: { contains: 'Тестовый' } } });
  
  // 1. Убедимся, что есть сырье на складе
  console.log('📦 Пополняем склад сырьем...');
  const flour = await prisma.rawMaterial.upsert({
    where: { name: 'Мука высший сорт' },
    update: { stock: 50000 },
    create: { name: 'Мука высший сорт', unit: 'г', stock: 50000, costPerUnit: 0.2 }
  });
  const oil = await prisma.rawMaterial.upsert({
    where: { name: 'Масло подсолнечное' },
    update: { stock: 10000 },
    create: { name: 'Масло подсолнечное', unit: 'мл', stock: 10000, costPerUnit: 0.5 }
  });

  // 2. Убедимся, что есть продукты с рецептами
  console.log('🍞 Проверяем продукты и рецепты...');
  const category = await prisma.category.findFirst() || await prisma.category.create({
    data: { name: 'Хлеба', iconName: 'Flame' }
  });

  const product1 = await prisma.product.upsert({
    where: { sku: 'BREAD-01' },
    update: {},
    create: { sku: 'BREAD-01', name: 'Хлеб Пшеничный', categoryId: category.id, price: 150 }
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'BATON-01' },
    update: {},
    create: { sku: 'BATON-01', name: 'Батон Нарезной', categoryId: category.id, price: 180 }
  });

  // Привязываем рецепты
  for (const prod of [product1, product2]) {
    const existingRecipe = await prisma.recipe.findUnique({ where: { productId: prod.id } });
    if (!existingRecipe) {
      await prisma.recipe.create({
        data: {
          productId: prod.id,
          ingredients: {
            create: [
              { rawMaterialId: flour.id, quantity: 300 },
              { rawMaterialId: oil.id, quantity: 20 }
            ]
          }
        }
      });
    }
  }

  // 3. Создаем клиента
  console.log('🏪 Создаем магазин-клиента...');
  const client = await prisma.client.create({
    data: {
      name: 'Магазин "У Дома" (Реальный тест)',
      type: 'Магазин у дома',
      phone: '+7 700 123 4567',
      address: 'Улица Абая 10'
    } as any // address is not in Client model, let's skip address in Client, it is in RoutePoint maybe or DeliveryOrder
  }).catch(async () => {
    // Fallback if address doesn't exist on Client model
    return await prisma.client.create({
      data: {
        name: 'Магазин "У Дома" (Реальный тест)',
        type: 'Магазин у дома',
        phone: '+7 700 123 4567',
      }
    });
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Супермаркет "Корзина"',
      type: 'Супермаркет',
      phone: '+7 777 999 8877',
    }
  });

  // 4. Создаем реальные заказы
  console.log('🛒 Формируем заказы...');
  await prisma.deliveryOrder.create({
    data: {
      clientName: client.name,
      clientPhone: client.phone || '',
      address: 'Улица Сейфуллина 15',
      totalAmount: (20 * 150) + (10 * 180),
      clientId: client.id,
      items: {
        create: [
          { productId: product1.id, quantity: 20, price: 150 },
          { productId: product2.id, quantity: 10, price: 180 }
        ]
      }
    }
  });

  await prisma.deliveryOrder.create({
    data: {
      clientName: client2.name,
      clientPhone: client2.phone || '',
      address: 'Проспект Достык 100',
      totalAmount: (50 * 150),
      clientId: client2.id,
      items: {
        create: [
          { productId: product1.id, quantity: 50, price: 150 }
        ]
      }
    }
  });

  console.log('✅ Идеальный сценарий создан!');
  console.log('Зайдите как Пекарь -> Вы увидите 2 заказа. Сверху будет ИТОГ: Пшеничный - 70 шт, Батон - 10 шт.');
  console.log('Нажмите "ОТМЕТИТЬ КАК ГОТОВЫЙ" -> заказы пропадут у Пекаря, но появятся у Курьера!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
