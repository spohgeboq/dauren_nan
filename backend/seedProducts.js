const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');

  let category = await prisma.category.findFirst({ where: { name: 'Хлебобулочные изделия' } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Хлебобулочные изделия',
        iconName: 'Bread',
      }
    });
  }

  const products = [
    { sku: 'BRD-01', name: 'Хлеб Пшеничный', price: 150 },
    { sku: 'BRD-02', name: 'Хлеб Ржаной', price: 180 },
    { sku: 'BRD-03', name: 'Батон Нарезной', price: 170 },
    { sku: 'BRD-04', name: 'Булочка с Кунжутом', price: 80 },
    { sku: 'BRD-05', name: 'Лепешка Тандырная', price: 200 },
    { sku: 'BRD-06', name: 'Бородинский Хлеб', price: 220 },
    { sku: 'BRD-07', name: 'Багет Французский', price: 250 },
  ];

  for (const p of products) {
    let exists = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (!exists) {
      await prisma.product.create({
        data: {
          sku: p.sku,
          name: p.name,
          price: p.price,
          categoryId: category.id,
          isActive: true,
        }
      });
    }
  }

  console.log('Products seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
