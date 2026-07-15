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
exports.PosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PosService = class PosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async openShift(userId, startCash) {
        await this.prisma.shift.updateMany({
            where: { userId, isOpen: true },
            data: { isOpen: false, closedAt: new Date() },
        });
        return this.prisma.shift.create({
            data: { userId, startCash, isOpen: true },
            include: { user: { select: { id: true, name: true } } },
        });
    }
    async closeShift(shiftId) {
        const sales = await this.prisma.sale.findMany({ where: { shiftId } });
        const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
        const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });
        return this.prisma.shift.update({
            where: { id: shiftId },
            data: { isOpen: false, closedAt: new Date(), endCash: (shift?.startCash || 0) + totalSales },
        });
    }
    async createSale(data) {
        const total = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.create({
                data: {
                    shiftId: data.shiftId,
                    userId: data.userId,
                    total,
                    paymentMethod: data.paymentMethod,
                    items: { create: data.items },
                },
                include: { items: { include: { product: { select: { id: true, name: true } } } } },
            });
            await tx.income.create({
                data: {
                    amount: total,
                    paymentMethod: data.paymentMethod,
                    source: 'POS',
                    description: `Продажа на точке (Чек #${sale.id})`,
                    isAuto: true,
                    userId: data.userId,
                },
            });
            return sale;
        });
    }
    async getActiveShift(userId) {
        return this.prisma.shift.findFirst({
            where: { userId, isOpen: true },
            include: { sales: { include: { items: true } } },
        });
    }
    async getShiftSummary(shiftId) {
        const sales = await this.prisma.sale.findMany({
            where: { shiftId },
            include: { items: { include: { product: true } } },
        });
        const totalCash = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
        const totalKaspi = sales.filter(s => s.paymentMethod === 'KASPI').reduce((sum, s) => sum + s.total, 0);
        return {
            salesCount: sales.length,
            totalCash,
            totalKaspi,
            totalRevenue: totalCash + totalKaspi,
        };
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosService);
//# sourceMappingURL=pos.service.js.map