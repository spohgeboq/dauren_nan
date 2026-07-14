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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(date) {
        const where = {};
        if (date) {
            const d = new Date(date);
            where.deliveryDate = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
        }
        return this.prisma.order.findMany({
            where,
            include: { client: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, name: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.order.findUnique({ where: { id }, include: { client: true, items: { include: { product: true } } } });
    }
    async create(data) {
        const total = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
        return this.prisma.order.create({
            data: {
                clientId: data.clientId,
                deliveryTime: data.deliveryTime,
                total,
                items: { create: data.items },
            },
            include: { items: { include: { product: true } }, client: true },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.order.update({ where: { id }, data: { status: status } });
    }
    async getStats() {
        const total = await this.prisma.order.count();
        const pending = await this.prisma.order.count({ where: { status: 'NEW' } });
        const orders = await this.prisma.order.findMany({ where: { status: { not: 'CANCELLED' } } });
        const totalSum = orders.reduce((sum, o) => sum + o.total, 0);
        return { totalOrders: total, pendingOrders: pending, totalSum };
    }
    async findAllDeliveries(date) {
        const where = {};
        if (date) {
            if (date === 'Сегодня') {
                const d = new Date();
                where.createdAt = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else if (date === 'Вчера') {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                where.createdAt = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else if (date === 'Завтра') {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                where.createdAt = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else {
                const d = new Date(date);
                where.createdAt = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
        }
        return this.prisma.deliveryOrder.findMany({
            where,
            include: {
                items: { include: { product: { select: { id: true, name: true } } } },
                driver: { select: { id: true, name: true } },
                client: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createDelivery(data) {
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client)
            throw new Error('Client not found');
        const totalAmount = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
        return this.prisma.deliveryOrder.create({
            data: {
                clientId: data.clientId,
                clientName: client.name,
                clientPhone: client.phone || '',
                address: client.route || '',
                totalAmount,
                status: 'PENDING',
                isBaked: false,
                items: {
                    create: data.items
                }
            },
            include: { items: { include: { product: true } }, client: true }
        });
    }
    async assignDriver(id, driverId) {
        return this.prisma.deliveryOrder.update({
            where: { id },
            data: { driverId },
            include: { driver: { select: { id: true, name: true } } }
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map