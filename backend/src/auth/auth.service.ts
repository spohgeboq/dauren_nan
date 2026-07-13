import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { login: dto.email }
        ]
      },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId, // добавлено для клиента B2B
      },
    };
  }
}
