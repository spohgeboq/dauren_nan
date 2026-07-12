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
exports.ClientWorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientWorkspaceService = class ClientWorkspaceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { client: true },
        });
        if (!user || !user.client) {
            throw new common_1.NotFoundException('Магазин не найден для данного пользователя');
        }
        const pastOrders = await this.prisma.deliveryOrder.findMany({
            where: { clientId: user.client.id },
            select: { address: true },
            distinct: ['address'],
        });
        const savedAddresses = pastOrders.map(o => o.address).filter(a => a && a !== 'Не указан');
        if (user.client.route && !savedAddresses.includes(user.client.route)) {
            savedAddresses.unshift(user.client.route);
        }
        return {
            name: user.client.name,
            address: user.client.route || 'Адрес не указан',
            savedAddresses,
            balance: user.client.balance,
            debt: user.client.balance,
            phone: user.client.phone,
        };
    }
    async getProducts() {
        return this.prisma.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async getActiveOrder(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.clientId)
            throw new common_1.NotFoundException('Магазин не найден');
        const activeOrder = await this.prisma.deliveryOrder.findFirst({
            where: {
                clientId: user.clientId,
                status: { in: ['PENDING', 'IN_TRANSIT'] },
            },
            include: {
                driver: {
                    select: { name: true, phone: true },
                },
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return activeOrder;
    }
    async getLastOrder(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.clientId)
            throw new common_1.NotFoundException('Магазин не найден');
        const lastOrder = await this.prisma.deliveryOrder.findFirst({
            where: { clientId: user.clientId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
            },
        });
        return lastOrder;
    }
    async getOrderHistory(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.clientId)
            throw new common_1.NotFoundException('Магазин не найден');
        return this.prisma.deliveryOrder.findMany({
            where: { clientId: user.clientId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                },
            },
        });
    }
    async createOrder(userId, items, paymentMethod, address) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { client: true },
        });
        if (!user || !user.clientId)
            throw new common_1.NotFoundException('Магазин не найден');
        const productIds = items.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        let totalAmount = 0;
        const orderItems = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product)
                throw new common_1.NotFoundException(`Продукт ${item.productId} не найден`);
            const price = product.price;
            totalAmount += price * item.quantity;
            return {
                productId: product.id,
                quantity: item.quantity,
                price: price,
            };
        });
        const finalAddress = address && address.trim() !== '' ? address.trim() : (user.client.route || 'Не указан');
        const newOrder = await this.prisma.deliveryOrder.create({
            data: {
                clientId: user.clientId,
                clientName: user.client.name,
                clientPhone: user.client.phone || '',
                address: finalAddress,
                totalAmount,
                status: 'PENDING',
                paymentMethod: paymentMethod || 'CASH',
                items: {
                    create: orderItems,
                },
            },
        });
        return newOrder;
    }
};
exports.ClientWorkspaceService = ClientWorkspaceService;
exports.ClientWorkspaceService = ClientWorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientWorkspaceService);
//# sourceMappingURL=client-workspace.service.js.map