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
exports.BakerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BakerService = class BakerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const products = await this.prisma.product.findMany({
            include: { recipe: { include: { ingredients: true } } },
        });
        const rawMaterials = await this.prisma.rawMaterial.findMany();
        const activeBatches = await this.prisma.productionBatch.findMany({
            where: { status: 'IN_PROGRESS' },
            include: { product: true },
            orderBy: { startTime: 'desc' },
        });
        return { products, rawMaterials, activeBatches };
    }
    async startBatch(productId, quantity, bakerId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { recipe: { include: { ingredients: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Продукт не найден');
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.productionBatch.create({
                data: {
                    productId,
                    quantity,
                    bakerId,
                    status: 'IN_PROGRESS',
                },
            });
            if (product.recipe) {
                for (const ing of product.recipe.ingredients) {
                    const totalNeeded = (ing.quantity || ing.amount || 0) * quantity;
                    await tx.rawMaterial.update({
                        where: { id: ing.rawMaterialId },
                        data: { stock: { decrement: totalNeeded } },
                    });
                }
            }
            return { success: true, batch };
        });
    }
    async finishBatch(batchId) {
        const batch = await this.prisma.productionBatch.findUnique({ where: { id: batchId } });
        if (!batch || batch.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Партия не найдена или уже завершена');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.productionBatch.update({
                where: { id: batchId },
                data: { status: 'COMPLETED', endTime: new Date() },
            });
            await tx.product.update({
                where: { id: batch.productId },
                data: { stock: { increment: batch.quantity } },
            });
            return { success: true };
        });
    }
    async recordDefect(productId, quantity, reason, bakerId) {
        const defect = await this.prisma.defectLog.create({
            data: { productId, quantity, reason, bakerId },
        });
        return { success: true, defect };
    }
};
exports.BakerService = BakerService;
exports.BakerService = BakerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BakerService);
//# sourceMappingURL=baker.service.js.map