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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchasesService = class PurchasesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.purchase.findMany({ include: { items: true }, orderBy: { date: 'desc' } });
    }
    async create(data) {
        return this.prisma.purchase.create({
            data: { supplier: data.supplier, totalSum: data.totalSum || 0, items: { create: data.items } },
            include: { items: true },
        });
    }
    async receive(id) {
        const purchase = await this.prisma.purchase.findUnique({ where: { id }, include: { items: true } });
        if (!purchase)
            return null;
        for (const item of purchase.items) {
            if (item.inventoryItemId) {
                const inv = await this.prisma.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (inv) {
                    await this.prisma.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: { currentStock: inv.currentStock + item.orderedQty * inv.conversionRatio },
                    });
                }
            }
        }
        return this.prisma.purchase.update({ where: { id }, data: { status: 'DELIVERED' } });
    }
    async getNeeds() {
        const items = await this.prisma.inventoryItem.findMany({ where: { currentStock: { lt: this.prisma.inventoryItem.fields?.minLimit } } });
        const all = await this.prisma.inventoryItem.findMany();
        return all.filter(i => i.currentStock < i.minLimit).map(i => ({
            id: i.id, name: i.name, currentStock: i.currentStock, minLimit: i.minLimit,
            recommendedQty: Math.ceil((i.minLimit - i.currentStock) / (i.conversionRatio || 1)),
            unit: i.purchaseUnit,
        }));
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map