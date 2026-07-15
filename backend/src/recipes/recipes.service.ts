import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recipe.findMany({
      include: { product: { select: { id: true, name: true } }, ingredients: { include: { rawMaterial: true } } },
    });
  }

  async findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: { product: true, ingredients: { include: { rawMaterial: true } } },
    });
  }

  async findByProductId(productId: number) {
    return this.prisma.recipe.findUnique({
      where: { productId },
      include: { product: true, ingredients: { include: { rawMaterial: true } } },
    });
  }

  async create(data: { productId: number; yield?: number; instructions?: string; ingredients?: { rawMaterialId: number; amount: number; unit?: string | null }[] }) {
    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          productId: data.productId,
          yield: data.yield || 1,
          instructions: data.instructions,
        },
      });

      let totalCostOnBatch = 0;

      if (data.ingredients && data.ingredients.length > 0) {
        for (const ing of data.ingredients) {
          const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
          let actualAmount = ing.amount;

          if (material) {
            const matUnit = (material.unit || '').toLowerCase();
            const ingUnit = (ing.unit || matUnit).toLowerCase();

            if (matUnit === 'кг' && ingUnit === 'г') actualAmount /= 1000;
            if (matUnit === 'л' && ingUnit === 'мл') actualAmount /= 1000;
            if (matUnit === 'г' && ingUnit === 'кг') actualAmount *= 1000;
            if (matUnit === 'мл' && ingUnit === 'л') actualAmount *= 1000;

            totalCostOnBatch += Number(material.costPerUnit) * actualAmount;
          }

          await tx.recipeIngredient.create({
            data: {
              recipeId: recipe.id,
              rawMaterialId: ing.rawMaterialId,
              amount: ing.amount,
              unit: ing.unit || null,
              quantity: recipe.yield > 0 ? actualAmount / recipe.yield : 0,
            },
          });
        }
      }

      const costPerUnit = recipe.yield > 0 ? totalCostOnBatch / recipe.yield : 0;

      await tx.product.update({
        where: { id: data.productId },
        data: { cost: costPerUnit },
      });

      return tx.recipe.findUnique({
        where: { id: recipe.id },
        include: { product: true, ingredients: { include: { rawMaterial: true } } },
      });
    });
  }

  async addIngredient(recipeId: number, data: { rawMaterialId: number; amount: number }) {
    return this.prisma.recipeIngredient.create({ data: { recipeId, ...data }, include: { rawMaterial: true } });
  }

  async updateIngredient(ingredientId: number, data: { rawMaterialId?: number; amount?: number }) {
    return this.prisma.recipeIngredient.update({ where: { id: ingredientId }, data, include: { rawMaterial: true } });
  }

  async removeIngredient(ingredientId: number) {
    return this.prisma.recipeIngredient.delete({ where: { id: ingredientId } });
  }

  async updateRecipe(recipeId: number, data: { yield: number; instructions?: string; ingredients: { rawMaterialId: number; amount: number; unit?: string | null }[] }) {
    // Используем транзакцию для атомарного обновления
    return this.prisma.$transaction(async (tx) => {
      // 1. Обновляем выход в рецепте и инструкцию
      await tx.recipe.update({
        where: { id: recipeId },
        data: { yield: data.yield, instructions: data.instructions },
      });

      // 2. Удаляем старые ингредиенты
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // 3. Считаем общую себестоимость сырья на замес
      let totalCostOnBatch = 0;

      // 4. Добавляем новые ингредиенты с рассчитанным quantity (на 1 штуку)
      if (data.ingredients && data.ingredients.length > 0) {
        for (const ing of data.ingredients) {
          const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
          let actualAmount = ing.amount;

          if (material) {
            const matUnit = (material.unit || '').toLowerCase();
            const ingUnit = (ing.unit || matUnit).toLowerCase();

            if (matUnit === 'кг' && ingUnit === 'г') actualAmount /= 1000;
            if (matUnit === 'л' && ingUnit === 'мл') actualAmount /= 1000;
            if (matUnit === 'г' && ingUnit === 'кг') actualAmount *= 1000;
            if (matUnit === 'мл' && ingUnit === 'л') actualAmount *= 1000;

            totalCostOnBatch += Number(material.costPerUnit) * actualAmount;
          }
          
          await tx.recipeIngredient.create({
            data: {
              recipeId,
              rawMaterialId: ing.rawMaterialId,
              amount: ing.amount,
              unit: ing.unit || null,
              quantity: data.yield > 0 ? actualAmount / data.yield : 0,
            },
          });
        }
      }

      // 5. Рассчитываем себестоимость 1 штуки товара
      const costPerUnit = data.yield > 0 ? totalCostOnBatch / data.yield : 0;

      // Получаем productId
      const recipe = await tx.recipe.findUnique({ where: { id: recipeId } });
      
      // 6. Обновляем себестоимость в таблице Product
      if (recipe) {
        await tx.product.update({
          where: { id: recipe.productId },
          data: { cost: costPerUnit },
        });
      }

      return tx.recipe.findUnique({
        where: { id: recipeId },
        include: { product: true, ingredients: { include: { rawMaterial: true } } },
      });
    });
  }

  async getRawMaterials() {
    return this.prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
  }

  async createRawMaterial(data: { name: string; unit?: string; costPerUnit?: number }) {
    return this.prisma.rawMaterial.create({ data });
  }
}
