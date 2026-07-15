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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
    }
    async findOne(id) {
        return this.prisma.rawMaterial.findUnique({ where: { id } });
    }
    async create(data) {
        return this.prisma.rawMaterial.create({ data });
    }
    async update(id, data) {
        return this.prisma.rawMaterial.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.inventoryAdjustment.deleteMany({ where: { rawMaterialId: id } });
            await tx.purchaseItem.deleteMany({ where: { rawMaterialId: id } });
            await tx.recipeIngredient.deleteMany({ where: { rawMaterialId: id } });
            return tx.rawMaterial.delete({ where: { id } });
        });
    }
    async adjust(data) {
        return this.prisma.$transaction(async (tx) => {
            const rm = await tx.rawMaterial.findUnique({ where: { id: data.rawMaterialId } });
            if (!rm)
                throw new common_1.BadRequestException('Сырье не найдено');
            const amountDecimal = new library_1.Decimal(data.amount);
            const costPerUnit = Number(rm.costPerUnit);
            const totalLoss = Math.abs(data.amount) * costPerUnit;
            const expense = await tx.expense.create({
                data: {
                    category: 'INVENTORY_LOSS',
                    description: `Списание/Инвентаризация: ${rm.name}. Причина: ${data.reason || 'Не указана'}`,
                    amount: totalLoss,
                    isAuto: true
                }
            });
            const adjustment = await tx.inventoryAdjustment.create({
                data: {
                    rawMaterialId: data.rawMaterialId,
                    type: data.type,
                    amount: amountDecimal,
                    reason: data.reason,
                    expenseId: expense.id
                }
            });
            const updatedRm = await tx.rawMaterial.update({
                where: { id: data.rawMaterialId },
                data: {
                    stock: { increment: amountDecimal }
                }
            });
            return { adjustment, newStock: updatedRm.stock };
        });
    }
    async getStats() {
        const items = await this.prisma.rawMaterial.findMany();
        const total = items.length;
        const critical = items.filter(i => Number(i.stock) < Number(i.minLimit)).length;
        const totalValue = items.reduce((sum, i) => sum + Number(i.stock) * Number(i.costPerUnit), 0);
        return { totalItems: total, criticalItems: critical, totalValue };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map