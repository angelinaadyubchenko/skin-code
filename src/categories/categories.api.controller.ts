import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  PaginatedCategoriesResponseDto,
  ProductInCategoryDto,
} from './dto/category-response.dto';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesApiController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список категорий с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список категорий', type: PaginatedCategoriesResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Параметры page и limit должны быть больше 0');
    }

    const result = await this.categoriesService.findAllPaginated(page, limit);
    const links: string[] = [];

    if (page > 1) {
      links.push(`</api/categories?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }

    if (page < result.meta.totalPages) {
      links.push(`</api/categories?page=${page + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiResponse({ status: 200, description: 'Категория найдена', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Получить все товары категории' })
  @ApiResponse({ status: 200, description: 'Список товаров категории', type: [ProductInCategoryDto] })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  async getProducts(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categoriesService.findOne(id);
    return category.products;
  }

  @Get(':id/products/:productId')
  @ApiOperation({ summary: 'Получить конкретный товар категории' })
  @ApiResponse({ status: 200, description: 'Товар категории найден', type: ProductInCategoryDto })
  @ApiResponse({ status: 404, description: 'Категория или товар не найдены' })
  getProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.categoriesService.findProduct(id, productId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiResponse({ status: 201, description: 'Категория создана', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'Категория с таким именем уже существует' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiResponse({ status: 200, description: 'Категория обновлена', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @ApiResponse({ status: 409, description: 'Категория с таким именем уже существует' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiResponse({ status: 200, description: 'Категория удалена', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
