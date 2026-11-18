import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedPassword: string) {
    if (!storedPassword.includes(':')) {
      return password === storedPassword;
    }

    const [salt, storedHash] = storedPassword.split(':');
    const hash = scryptSync(password, salt, 64);
    return timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
  }

  private getRole(name: string) {
    return name.trim().toLowerCase() === 'admin' ? 'ADMIN' : 'USER';
  }

  private toSessionUser(user: { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async register(data: { email: string; name: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: this.hashPassword(data.password),
        role: this.getRole(data.name),
      },
    });

    return this.toSessionUser(user);
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !this.verifyPassword(data.password, user.password)) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.toSessionUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!this.verifyPassword(currentPassword, user.password)) {
      throw new BadRequestException('Текущий пароль введён неверно');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: this.hashPassword(newPassword),
      },
    });
  }
}
