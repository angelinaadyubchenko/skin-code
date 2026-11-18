import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
      },
      include: { products: true },
    });
  }

  findAll() {
    return this.prisma.category.findMany({ include: { products: true } });
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        include: { products: true },
      }),
      this.prisma.category.count(),
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException(`Категория с id ${id} не найдена`);
    }

    return category;
  }

  async findProduct(categoryId: string, productId: string) {
    const category = await this.findOne(categoryId);
    const product = category.products.find((item) => item.id === productId);

    if (!product) {
      throw new NotFoundException(`Товар с id ${productId} не найден в категории ${categoryId}`);
    }

    return product;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: { products: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
      include: { products: true },
    });
  }
}
