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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.vehicle.findMany({ include: { driver: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        return this.prisma.vehicle.findUnique({ where: { id }, include: { driver: true } });
    }
    async create(data) {
        return this.prisma.vehicle.create({
            data: { ...data, status: (data.status || 'ACTIVE') },
            include: { driver: { select: { id: true, name: true } } },
        });
    }
    async update(id, data) {
        if (data.status)
            data.status = data.status;
        return this.prisma.vehicle.update({ where: { id }, data, include: { driver: { select: { id: true, name: true } } } });
    }
    async remove(id) {
        return this.prisma.vehicle.delete({ where: { id } });
    }
    async getStats() {
        const total = await this.prisma.vehicle.count();
        const active = await this.prisma.vehicle.count({ where: { status: 'ACTIVE' } });
        const repair = await this.prisma.vehicle.count({ where: { status: 'REPAIR' } });
        return { total, active, repair };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map