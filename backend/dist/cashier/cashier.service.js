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
exports.CashierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CashierService = class CashierService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts() {
        const products = await this.prisma.product.findMany({
            orderBy: { id: 'asc' },
        });
        return { products };
    }
    async sell(cart, paymentMethod, cashierId) {
        let totalAmount = 0;
        const saleItems = cart.map((item) => {
            totalAmount += item.price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            };
        });
        return this.prisma.$transaction(async (tx) => {
            let activeShift = await tx.shift.findFirst({
                where: { userId: cashierId, isOpen: true },
            });
            if (!activeShift) {
                activeShift = await tx.shift.create({
                    data: {
                        userId: cashierId,
                        startCash: 0,
                        isOpen: true,
                    },
                });
            }
            let pm = client_1.PaymentMethod.CASH;
            if (paymentMethod.toUpperCase() === 'KASPI') {
                pm = client_1.PaymentMethod.KASPI;
            }
            const sale = await tx.sale.create({
                data: {
                    shiftId: activeShift.id,
                    userId: cashierId,
                    total: totalAmount,
                    paymentMethod: pm,
                    items: {
                        create: saleItems,
                    },
                },
            });
            for (const item of saleItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            return { success: true, totalAmount, saleId: sale.id };
        });
    }
};
exports.CashierService = CashierService;
exports.CashierService = CashierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashierService);
//# sourceMappingURL=cashier.service.js.map