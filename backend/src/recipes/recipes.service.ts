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

  async create(data: { productId: number; ingredients?: { rawMaterialId: number; amount: number }[] }) {
    return this.prisma.recipe.create({
      data: {
        productId: data.productId,
        ingredients: data.ingredients ? { create: data.ingredients } : undefined,
      },
      include: { product: true, ingredients: { include: { rawMaterial: true } } },
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

  async getRawMaterials() {
    return this.prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
  }

  async createRawMaterial(data: { name: string; unit?: string; costPerUnit?: number }) {
    return this.prisma.rawMaterial.create({ data });
  }
}
