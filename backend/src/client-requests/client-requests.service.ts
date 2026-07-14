import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
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

  async approve(id: number, dto: any) {
    const request = await this.prisma.clientRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Заявка не найдена');
    if (request.status !== 'PENDING') throw new BadRequestException('Заявка уже обработана');

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

  async reject(id: number) {
    return this.prisma.clientRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
