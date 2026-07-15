import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { EmployeeStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    const where: any = {};
    if (role && role !== 'Все') {
      where.role = role;
    }
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        login: true,
        role: true,
        status: true,
        isOnShift: true,
        fixedSalary: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        login: true,
        role: true,
        status: true,
        isOnShift: true,
        fixedSalary: true,
        createdAt: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        login: dto.login,
        pin: dto.pin,
        role: dto.role,
        fixedSalary: dto.fixedSalary || 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        login: true,
        role: true,
        status: true,
        isOnShift: true,
        fixedSalary: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.status !== undefined) data.status = dto.status as EmployeeStatus;
    if (dto.login !== undefined) data.login = dto.login;
    if (dto.fixedSalary !== undefined) data.fixedSalary = dto.fixedSalary;
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        login: true,
        role: true,
        status: true,
        isOnShift: true,
        fixedSalary: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
