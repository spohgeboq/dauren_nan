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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoutesService = class RoutesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(date) {
        const where = {};
        if (date) {
            if (date === 'Сегодня') {
                const d = new Date();
                where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else if (date === 'Вчера') {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else if (date === 'Завтра') {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
            else {
                const d = new Date(date);
                where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
            }
        }
        return this.prisma.deliveryRoute.findMany({
            where,
            include: { driver: { select: { id: true, name: true } }, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: { select: { id: true, name: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.deliveryRoute.findUnique({ where: { id }, include: { driver: true, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: true } } } });
    }
    async createWithAutoLoad(data) {
        let dateStart, dateEnd;
        if (data.date === 'Сегодня') {
            const d = new Date();
            dateStart = new Date(d.setHours(0, 0, 0, 0));
            dateEnd = new Date(d.setHours(23, 59, 59, 999));
        }
        else if (data.date === 'Завтра') {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            dateStart = new Date(d.setHours(0, 0, 0, 0));
            dateEnd = new Date(d.setHours(23, 59, 59, 999));
        }
        else {
            const d = new Date(data.date);
            dateStart = new Date(d.setHours(0, 0, 0, 0));
            dateEnd = new Date(d.setHours(23, 59, 59, 999));
        }
        const orders = await this.prisma.deliveryOrder.findMany({
            where: {
                clientId: { in: data.clientIds },
                createdAt: { gte: dateStart, lt: dateEnd },
                status: { in: ['PENDING', 'IN_TRANSIT', 'DELIVERED'] }
            },
            include: {
                client: true,
                items: true
            }
        });
        const pointsData = [];
        orders.forEach(order => {
            pointsData.push({
                clientId: order.clientId,
                storeName: order.client?.name || order.clientName,
                totalSum: order.totalAmount,
                status: 'PENDING',
                sortOrder: pointsData.length
            });
        });
        const clientsWithOrders = orders.map(o => o.clientId);
        const missingClientIds = data.clientIds.filter(id => !clientsWithOrders.includes(id));
        if (missingClientIds.length > 0) {
            const missingClients = await this.prisma.client.findMany({ where: { id: { in: missingClientIds } } });
            missingClients.forEach(c => {
                pointsData.push({
                    clientId: c.id,
                    storeName: c.name,
                    totalSum: 0,
                    status: 'PENDING',
                    sortOrder: pointsData.length
                });
            });
        }
        const productCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productCounts[item.productId])
                    productCounts[item.productId] = 0;
                productCounts[item.productId] += item.quantity;
            });
        });
        const loadItemsData = Object.keys(productCounts).map(prodId => ({
            productId: Number(prodId),
            quantity: productCounts[Number(prodId)]
        }));
        await this.prisma.deliveryOrder.updateMany({
            where: {
                id: { in: orders.map(o => o.id) }
            },
            data: {
                driverId: data.driverId
            }
        });
        return this.prisma.deliveryRoute.create({
            data: {
                name: data.name,
                driverId: data.driverId,
                date: dateStart,
                points: { create: pointsData },
                loadItems: { create: loadItemsData },
            },
            include: { driver: true, points: true, loadItems: { include: { product: true } } }
        });
    }
    async updatePointStatus(routeId, pointId, status) {
        return this.prisma.routePoint.update({ where: { id: pointId }, data: { status: status } });
    }
    async updateRouteStatus(id, status) {
        return this.prisma.deliveryRoute.update({ where: { id }, data: { status: status } });
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoutesService);
//# sourceMappingURL=routes.service.js.map