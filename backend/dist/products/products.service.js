"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(categoryId) {
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        return this.prisma.product.findMany({
            where,
            include: { category: { select: { id: true, name: true } }, recipe: { select: { id: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    }
    async create(dto) {
        const count = await this.prisma.product.count();
        const sku = dto.sku || `PRD-${String(count + 1).padStart(3, '0')}`;
        return this.prisma.product.create({
            data: { ...dto, sku },
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async update(id, dto) {
        return this.prisma.product.update({
            where: { id },
            data: dto,
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.orderItem.deleteMany({ where: { productId: id } });
            await tx.saleItem.deleteMany({ where: { productId: id } });
            await tx.loadItem.deleteMany({ where: { productId: id } });
            await tx.deliveryOrderItem.deleteMany({ where: { productId: id } });
            await tx.productionBatch.deleteMany({ where: { productId: id } });
            await tx.defectLog.deleteMany({ where: { productId: id } });
            const tasks = await tx.productionTask.findMany({ where: { productId: id }, select: { id: true } });
            if (tasks.length > 0) {
                await tx.batchLog.deleteMany({ where: { taskId: { in: tasks.map(t => t.id) } } });
            }
            await tx.productionTask.deleteMany({ where: { productId: id } });
            const recipe = await tx.recipe.findUnique({ where: { productId: id } });
            if (recipe) {
                await tx.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
                await tx.recipe.delete({ where: { id: recipe.id } });
            }
            return tx.product.delete({ where: { id } });
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map