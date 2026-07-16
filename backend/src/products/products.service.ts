import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: number) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    return this.prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } }, recipe: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(dto: CreateProductDto) {
    const count = await this.prisma.product.count();
    const sku = dto.sku || `PRD-${String(count + 1).padStart(3, '0')}`;
    return this.prisma.product.create({
      data: { ...dto, sku },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // Удаляем связанные записи из всех зависимых таблиц
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.saleItem.deleteMany({ where: { productId: id } });
      await tx.loadItem.deleteMany({ where: { productId: id } });
      await tx.deliveryOrderItem.deleteMany({ where: { productId: id } });
      await tx.productionBatch.deleteMany({ where: { productId: id } });
      await tx.defectLog.deleteMany({ where: { productId: id } });

      // Удаляем BatchLog через ProductionTask
      const tasks = await tx.productionTask.findMany({ where: { productId: id }, select: { id: true } });
      if (tasks.length > 0) {
        await tx.batchLog.deleteMany({ where: { taskId: { in: tasks.map(t => t.id) } } });
      }
      await tx.productionTask.deleteMany({ where: { productId: id } });

      // Удаляем рецепт и его ингредиенты
      const recipe = await tx.recipe.findUnique({ where: { productId: id } });
      if (recipe) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
        await tx.recipe.delete({ where: { id: recipe.id } });
      }

      // Наконец удаляем сам продукт
      return tx.product.delete({ where: { id } });
    });
  }
}
