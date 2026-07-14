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
exports.ClientRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let ClientRequestsService = class ClientRequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.clientRequest.create({
            data: {
                clientName: dto.clientName,
                clientType: dto.clientType || 'Магазин',
                phone: dto.phone,
                contactName: dto.contactName,
                address: dto.address,
                deliveryTime: dto.deliveryTime,
                comment: dto.comment,
            },
        });
    }
    async findAll() {
        return this.prisma.clientRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async approve(id, dto) {
        const request = await this.prisma.clientRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Заявка не найдена');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Заявка уже обработана');
        const newClient = await this.prisma.client.create({
            data: {
                name: request.clientName,
                type: request.clientType,
                ownerName: request.contactName,
                phone: request.phone,
                route: request.address,
                deliveryTime: request.deliveryTime,
            },
        });
        if (dto.login && dto.password) {
            const passwordHash = await bcrypt.hash(dto.password, 10);
            await this.prisma.user.create({
                data: {
                    email: `${dto.login}@daurennan.kz`,
                    login: dto.login,
                    passwordHash,
                    name: request.contactName,
                    phone: request.phone,
                    role: 'CLIENT',
                    clientId: newClient.id,
                },
            });
        }
        return this.prisma.clientRequest.update({
            where: { id },
            data: { status: 'APPROVED' },
        });
    }
    async reject(id) {
        return this.prisma.clientRequest.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }
};
exports.ClientRequestsService = ClientRequestsService;
exports.ClientRequestsService = ClientRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientRequestsService);
//# sourceMappingURL=client-requests.service.js.map