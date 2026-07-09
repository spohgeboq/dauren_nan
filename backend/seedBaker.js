const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding baker data...');

  // 1. Сырье
  const flour = await prisma.rawMaterial.upsert({
    where: { name: 'Мука пшеничная' },
    update: { stock: 1000 },
    create: { name: 'Мука пшеничная', unit: 'кг', stock: 1000 }
  });
  const water = await prisma.rawMaterial.upsert({
    where: { name: 'Вода' },
    update: { stock: 500 },
    create: { name: 'Вода', unit: 'л', stock: 500 }
  });
  const yeast = await prisma.rawMaterial.upsert({
    where: { name: 'Дрожжи' },
    update: { stock: 10 },
    create: { name: 'Дрожжи', unit: 'кг', stock: 10 }
  });
  const salt = await prisma.rawMaterial.upsert({
    where: { name: 'Соль' },
    update: { stock: 50 },
    create: { name: 'Соль', unit: 'кг', stock: 50 }
  });

  // 2. Продукты
  const productsList = ['Таба нан', 'Патыр нан', 'Үй наны', 'Ромашка нан', 'Лепешка нан', 'Серый лепешка', 'Булка нан'];
  
  for (const pName of productsList) {
    const prod = await prisma.product.upsert({
      where: { name: pName },
      update: {},
      create: { name: pName, stock: 0 }
    });

    // Создаем рецепт (техкарту) для каждого (упрощенно)
    if (pName === 'Таба нан') {
      const existingRecipe = await prisma.recipe.findFirst({ where: { name: 'Рецепт Таба нан' } });
      if (!existingRecipe) {
        const recipe = await prisma.recipe.create({
          data: {
            name: 'Рецепт Таба нан',
            product: { connect: { id: prod.id } },
            ingredients: {
              create: [
                { rawMaterialId: flour.id, quantity: 0.3 }, // 300г муки на 1 шт
                { rawMaterialId: water.id, quantity: 0.15 }, // 150мл воды
                { rawMaterialId: yeast.id, quantity: 0.005 }, // 5г дрожжей
                { rawMaterialId: salt.id, quantity: 0.005 } // 5г соли
              ]
            }
          }
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
