import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { CacheControl } from '../decorators/cache-control.decorator';
import { ReviewResponseDto } from '../reviews/dto/review-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto, PaginatedProductsResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('api/products')
export class ProductsApiController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @CacheControl('public, max-age=3600')
  @ApiOperation({ summary: 'Получить список товаров с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список товаров', type: PaginatedProductsResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Параметры page и limit должны быть больше 0');
    }

    const result = await this.productsService.findAllPaginated(page, limit);
    const links: string[] = [];

    if (page > 1) {
      links.push(`</api/products?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }

    if (page < result.meta.totalPages) {
      links.push(`</api/products?page=${page + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return result;
  }

  @Get(':id')
  @CacheControl('public, max-age=3600')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiResponse({ status: 200, description: 'Товар найден', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/reviews')
  @CacheControl('public, max-age=60')
  @ApiOperation({ summary: 'Получить все отзывы на товар' })
  @ApiResponse({ status: 200, description: 'Список отзывов товара', type: [ReviewResponseDto] })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  getReviews(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getReviews(id);
  }

  @Get(':id/reviews/:reviewId')
  @CacheControl('public, max-age=60')
  @ApiOperation({ summary: 'Получить конкретный отзыв на товар' })
  @ApiResponse({ status: 200, description: 'Отзыв товара найден', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Товар или отзыв не найдены' })
  getReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
  ) {
    return this.productsService.getReview(id, reviewId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать товар' })
  @ApiResponse({ status: 201, description: 'Товар создан', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Загрузить изображение товара' })
  @ApiResponse({ status: 200, description: 'Изображение загружено', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.uploadImage(id, file);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiResponse({ status: 200, description: 'Товар обновлён', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiResponse({ status: 200, description: 'Товар удалён', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
