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
        return this.prisma.purchase.findMany({
            include: { items: true, supplier: true },
            orderBy: { date: 'desc' }
        });
    }
    async create(data) {
        const formattedItems = data.items.map(item => ({
            name: item.name,
            orderedQty: item.orderedQty,
            unit: item.unit,
            price: item.price || 0,
            rawMaterial: { connect: { id: item.rawMaterialId } }
        }));
        let supplierId = null;
        if (data.supplierName && data.supplierName.trim()) {
            const supplierName = data.supplierName.trim();
            const supplier = await this.prisma.supplier.upsert({
                where: { name: supplierName },
                update: {},
                create: { name: supplierName },
            });
            supplierId = supplier.id;
        }
        const purchase = await this.prisma.purchase.create({
            data: {
                date: data.date ? new Date(data.date) : new Date(),
                supplierId,
                totalSum: data.totalSum || 0,
                items: { create: formattedItems }
            },
            include: { items: true, supplier: true },
        });
        if (data.isPaidRightNow && data.totalSum) {
            if (supplierId) {
                await this.receive(purchase.id);
                await this.paySupplier(supplierId, data.totalSum, data.paymentMethod);
            }
            else {
                await this.prisma.expense.create({
                    data: {
                        category: 'INGREDIENTS',
                        description: `Прямая закупка сырья (без поставщика)`,
                        amount: data.totalSum,
                        paymentMethod: (data.paymentMethod || 'CASH'),
                        isAuto: true
                    }
                });
                await this.receive(purchase.id);
            }
        }
        return purchase;
    }
    async receive(id) {
        const purchase = await this.prisma.purchase.findUnique({ where: { id }, include: { items: true, supplier: true } });
        if (!purchase)
            return null;
        for (const item of purchase.items) {
            if (item.rawMaterialId) {
                const rm = await this.prisma.rawMaterial.findUnique({ where: { id: item.rawMaterialId } });
                if (rm) {
                    const oldStock = Number(rm.stock);
                    const oldCost = Number(rm.costPerUnit);
                    const addedStock = Number(item.orderedQty);
                    const totalItemPrice = Number(item.price || 0);
                    const costPerNewUnit = addedStock > 0 ? totalItemPrice / addedStock : 0;
                    let newCost = oldCost;
                    if (oldStock + addedStock > 0 && totalItemPrice > 0) {
                        newCost = ((oldStock * oldCost) + totalItemPrice) / (oldStock + addedStock);
                    }
                    else if (totalItemPrice > 0) {
                        newCost = costPerNewUnit;
                    }
                    await this.prisma.rawMaterial.update({
                        where: { id: item.rawMaterialId },
                        data: {
                            stock: { increment: addedStock },
                            costPerUnit: newCost
                        },
                    });
                }
            }
        }
        if (purchase.supplierId && purchase.totalSum) {
            await this.prisma.supplier.update({
                where: { id: purchase.supplierId },
                data: { balance: { increment: purchase.totalSum } }
            });
        }
        return this.prisma.purchase.update({ where: { id }, data: { status: 'DELIVERED' } });
    }
    async getSuppliers() {
        return this.prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    }
    async createSupplier(data) {
        return this.prisma.supplier.create({ data });
    }
    async paySupplier(supplierId, amount, paymentMethod = 'CASH') {
        return this.prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.update({
                where: { id: supplierId },
                data: { balance: { decrement: amount } }
            });
            const expense = await tx.expense.create({
                data: {
                    category: 'INGREDIENTS',
                    description: `Оплата поставщику: ${supplier.name}`,
                    amount: amount,
                    paymentMethod: paymentMethod,
                    isAuto: true
                }
            });
            await tx.supplierPayment.create({
                data: {
                    supplierId,
                    amount,
                    expenseId: expense.id
                }
            });
            return supplier;
        });
    }
    async getNeeds() {
        const all = await this.prisma.rawMaterial.findMany();
        return all.filter(i => Number(i.stock) < Number(i.minLimit)).map(i => ({
            id: i.id, name: i.name, currentStock: i.stock, minLimit: i.minLimit,
            recommendedQty: Number(i.minLimit) - Number(i.stock),
            unit: i.unit,
        }));
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map