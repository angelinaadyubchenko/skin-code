import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(@Req() req, @Res() res) {
    const sessionUser = req.session['user'];
    const orders = sessionUser?.role === 'ADMIN'
      ? await this.ordersService.findAll()
      : sessionUser
        ? await this.ordersService.findByUserId(sessionUser.id)
        : [];
    return res.render('orders/index', { orders, isOrders: true, user: sessionUser || null });
  }

  @Get('add')
  async addPage(@Req() req, @Res() res) {
    const sessionUser = req.session['user'] || null;
    const products = await this.prisma.product.findMany();
    const users = sessionUser?.role === 'ADMIN' ? await this.prisma.user.findMany() : null;
    return res.render('orders/add', { isOrders: true, user: sessionUser, users, products });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    const order = await this.ordersService.findOne(id);
    return res.render('orders/show', { order, isOrders: true, user: req.session['user'] || null });
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req, @Res() res) {
    const order = await this.ordersService.findOne(id);
    const users = await this.prisma.user.findMany();
    return res.render('orders/edit', { order, isOrders: true, user: req.session['user'] || null, users });
  }

  @Post()
  async create(@Body() dto: CreateOrderDto, @Res() res) {
    await this.ordersService.create(dto);
    return res.redirect('/orders');
  }

  @Post(':id/edit')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @Res() res) {
    await this.ordersService.update(id, dto);
    return res.redirect(`/orders/${id}`);
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string, @Res() res) {
    await this.ordersService.remove(id);
    return res.redirect('/orders');
  }
}