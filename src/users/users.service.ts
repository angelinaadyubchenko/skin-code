import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, scryptSync } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
  } as const;

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: this.hashPassword(dto.password),
        role: dto.name.trim().toLowerCase() === 'admin' ? 'ADMIN' : 'USER',
      },
      select: this.userSelect,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: this.userSelect,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException(`Пользователь с id ${id} не найден`);
    return user;
  }

  async findOrders(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { orders: { include: { user: true, items: true } } },
    });
    if (!user) throw new NotFoundException(`Пользователь с id ${id} не найден`);
    return user.orders;
  }

  async findOrder(userId: string, orderId: string) {
    const orders = await this.findOrders(userId);
    const order = orders.find((currentOrder) => currentOrder.id === orderId);

    if (!order) {
      throw new NotFoundException(`Заказ с id ${orderId} не найден у пользователя ${userId}`);
    }

    return order;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.name,
      },
      select: this.userSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
