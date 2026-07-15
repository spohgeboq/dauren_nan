const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Generating test data for Recipes and Inventory...');

  // 1. Create Raw Materials
  const flour = await prisma.rawMaterial.upsert({
    where: { name: 'Мука пшеничная' },
    update: { stock: 1000000 }, // 1 ton in grams
    create: { name: 'Мука пшеничная', unit: 'г', costPerUnit: 0.25, stock: 1000000 }
  });

  const yeast = await prisma.rawMaterial.upsert({
    where: { name: 'Дрожжи' },
    update: { stock: 50000 }, // 50kg
    create: { name: 'Дрожжи', unit: 'г', costPerUnit: 1.5, stock: 50000 }
  });

  const water = await prisma.rawMaterial.upsert({
    where: { name: 'Вода' },
    update: { stock: 2000000 }, // 2 tons
    create: { name: 'Вода', unit: 'мл', costPerUnit: 0.01, stock: 2000000 }
  });

  const salt = await prisma.rawMaterial.upsert({
    where: { name: 'Соль' },
    update: { stock: 100000 }, // 100kg
    create: { name: 'Соль', unit: 'г', costPerUnit: 0.1, stock: 100000 }
  });

  // 2. Fetch some products
  const products = await prisma.product.findMany({ take: 3 });

  // 3. Create recipes for these products
  for (const product of products) {
    let recipe = await prisma.recipe.findUnique({ where: { productId: product.id } });
    
    if (!recipe) {
      recipe = await prisma.recipe.create({
        data: {
          productId: product.id,
        }
      });
      console.log(`Created recipe for product: ${product.name}`);
    } else {
      // Clear existing ingredients to avoid duplicates
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
    }

    // Add ingredients (e.g. 1 unit of product needs 300g flour, 10g yeast, 150ml water, 5g salt)
    await prisma.recipeIngredient.createMany({
      data: [
        { recipeId: recipe.id, rawMaterialId: flour.id, quantity: 300, amount: 300 },
        { recipeId: recipe.id, rawMaterialId: yeast.id, quantity: 10, amount: 10 },
        { recipeId: recipe.id, rawMaterialId: water.id, quantity: 150, amount: 150 },
        { recipeId: recipe.id, rawMaterialId: salt.id, quantity: 5, amount: 5 },
      ]
    });
  }

  console.log('Successfully populated raw materials and recipes!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
