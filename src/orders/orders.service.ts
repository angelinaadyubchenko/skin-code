import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const productIds = Array.isArray(dto.productIds) ? dto.productIds : [dto.productIds];
    const quantities = Array.isArray(dto.quantities) ? dto.quantities : [dto.quantities];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalPrice = 0;
    const items = productIds.map((productId, i) => {
      const product = products.find(p => p.id === productId);
      const qty = Number(quantities[i]) || 1;
      const price = product ? product.price : 0;
      totalPrice += price * qty;
      return {
        productId,
        quantity: qty,
        price,
      };
    });

    return this.prisma.order.create({
      data: {
        userId: dto.userId,
        totalPrice,
        items: {
          create: items,
        },
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: { user: true, items: { include: { product: true } } },
      }),
      this.prisma.order.count(),
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Заказ с id ${id} не найден`);
    return order;
  }

  async findItems(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Заказ с id ${id} не найден`);
    return order.items;
  }

  async findItem(orderId: string, itemId: string) {
    const items = await this.findItems(orderId);
    const item = items.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      throw new NotFoundException(`Позиция заказа с id ${itemId} не найдена`);
    }

    return item;
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }

  async confirm(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async ship(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: 'SHIPPED' },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async deliver(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.delete({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }
}
