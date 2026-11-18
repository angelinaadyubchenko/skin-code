import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { Subject } from 'rxjs';
import type { Cache } from 'cache-manager';

type ProductEvent = {
  action: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    categoryName: string;
  };
};

@Injectable()
export class ProductsService {
  private static readonly CACHE_TTL_MS = 5000;

  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private eventsSubject = new Subject<ProductEvent>();
  events$ = this.eventsSubject.asObservable();

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: Number(createProductDto.price),
        stock: Number(createProductDto.stock),
        categoryId: createProductDto.categoryId,
      },
      include: {
        category: true,
      },
    });

    this.eventsSubject.next({
      action: 'создан',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryName: product.category.name,
      },
    });

    await this.resetCache();
    return product;
  }

  findAll() {
    return this.prisma.product.findMany({ include: { category: true } });
  }

  async findOne(id: string) {
    const cacheKey = this.getProductCacheKey(id);
    const cachedProduct = await this.cacheManager.get<Awaited<ReturnType<ProductsService['findOneFromDb']>>>(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.findOneFromDb(id);

    if (!product) {
      throw new NotFoundException(`Товар с id ${id} не найден`);
    }

    await this.cacheManager.set(cacheKey, product, ProductsService.CACHE_TTL_MS);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price:
          updateProductDto.price !== undefined
            ? Number(updateProductDto.price)
            : undefined,
        stock:
          updateProductDto.stock !== undefined
            ? Number(updateProductDto.stock)
            : undefined,
        categoryId: updateProductDto.categoryId,
      },
      include: {
        category: true,
      },
    });

    this.eventsSubject.next({
      action: 'обновлён',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryName: product.category.name,
      },
    });

    await this.resetCache();
    return product;
  }

  async publish(id: string) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { published: true },
      include: { category: true },
    });
    await this.resetCache();
    return product;
  }

  async hide(id: string) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { published: false },
      include: { category: true },
    });
    await this.resetCache();
    return product;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.orderItem.deleteMany({ where: { productId: id } });
    await this.prisma.review.deleteMany({ where: { productId: id } });

    const product = await this.prisma.product.delete({
      where: { id },
      include: {
        category: true,
      },
    });

    this.eventsSubject.next({
      action: 'удалён',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryName: product.category.name,
      },
    });

    await this.resetCache();
    return product;
  }

  async findAllPaginated(page: number, limit: number) {
    const cacheKey = this.getProductsListCacheKey(page, limit);
    const cachedPage = await this.cacheManager.get<Awaited<ReturnType<ProductsService['findAllPaginatedFromDb']>>>(cacheKey);
    if (cachedPage) {
      return cachedPage;
    }

    const result = await this.findAllPaginatedFromDb(page, limit);
    await this.cacheManager.set(cacheKey, result, ProductsService.CACHE_TTL_MS);
    return result;
  }

  async getReviews(id: string) {
    await this.findOne(id);
    return this.prisma.review.findMany({
      where: { productId: id },
      include: { user: true, product: true },
    });
  }

  async getReview(productId: string, reviewId: string) {
    await this.findOne(productId);

    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, productId },
      include: { user: true, product: true },
    });

    if (!review) {
      throw new NotFoundException(
        `Отзыв с id ${reviewId} не найден у товара ${productId}`,
      );
    }

    return review;
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const product = await this.findOne(id);

    if (product.imageUrl) {
      await this.s3.delete(product.imageUrl);
    }

    const imageUrl = await this.s3.upload(file);

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { imageUrl },
      include: { category: true },
    });
    await this.resetCache();
    return updatedProduct;
  }

  private findOneFromDb(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true },
    });
  }

  private async findAllPaginatedFromDb(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count(),
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

  private getProductCacheKey(id: string) {
    return `products:item:${id}`;
  }

  private getProductsListCacheKey(page: number, limit: number) {
    return `products:list:${page}:${limit}`;
  }

  private async resetCache() {
    await this.cacheManager.clear();
  }
}
