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
    async findAll() {
        return this.prisma.deliveryRoute.findMany({
            include: { driver: { select: { id: true, name: true } }, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: { select: { id: true, name: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.deliveryRoute.findUnique({ where: { id }, include: { driver: true, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: true } } } });
    }
    async create(data) {
        return this.prisma.deliveryRoute.create({
            data: {
                name: data.name,
                driverId: data.driverId,
                loadItems: data.loadItems ? { create: data.loadItems } : undefined,
                points: data.points ? { create: data.points.map((p, i) => ({ ...p, sortOrder: i })) } : undefined,
            },
            include: { driver: true, points: true, loadItems: { include: { product: true } } },
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