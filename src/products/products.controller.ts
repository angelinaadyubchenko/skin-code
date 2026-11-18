import { Controller, Get, Post, Body, Param, Req, Res, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  private isAdmin(user: { role?: string } | null | undefined) {
    return user?.role === 'ADMIN';
  }

  @Sse('events')
  sse(): Observable<MessageEvent> {
    return this.productsService.events$.pipe(
      map(data => ({ data: JSON.stringify(data) }) as MessageEvent),
    );
  }

  @Get()
  async findAll(@Req() req, @Res() res) {
    const products = await this.productsService.findAll();
    return res.render('products/index', { products, isProducts: true, user: req.session['user'] || null });
  }

  @Get('add')
  async addPage(@Req() req, @Res() res) {
    if (!this.isAdmin(req.session['user'])) {
      return res.redirect('/products');
    }

    const categories = await this.prisma.category.findMany();
    return res.render('products/add', { isProducts: true, user: req.session['user'] || null, categories });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    const product = await this.productsService.findOne(id);
    return res.render('products/show', { product, isProducts: true, user: req.session['user'] || null });
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req, @Res() res) {
    if (!this.isAdmin(req.session['user'])) {
      return res.redirect('/products');
    }

    const product = await this.productsService.findOne(id);
    const categories = await this.prisma.category.findMany();
    return res.render('products/edit', { product, isProducts: true, user: req.session['user'] || null, categories });
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Res() res) {
    if (!this.isAdmin(res.req.session['user'])) {
      return res.redirect('/products');
    }

    await this.productsService.create(createProductDto);
    return res.redirect('/products');
  }

  @Post(':id/edit')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Res() res) {
    if (!this.isAdmin(res.req.session['user'])) {
      return res.redirect('/products');
    }

    await this.productsService.update(id, updateProductDto);
    return res.redirect(`/products/${id}`);
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string, @Res() res) {
    if (!this.isAdmin(res.req.session['user'])) {
      return res.redirect('/products');
    }

    await this.productsService.remove(id);
    return res.redirect('/products');
  }
}
