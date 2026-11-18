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
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginatedReviewsResponseDto, ReviewResponseDto } from './dto/review-response.dto';

@ApiTags('reviews')
@Controller('api/reviews')
export class ReviewsApiController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список отзывов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список отзывов', type: PaginatedReviewsResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Параметры page и limit должны быть больше 0');
    }

    const result = await this.reviewsService.findAllPaginated(page, limit);
    const links: string[] = [];

    if (page > 1) {
      links.push(`</api/reviews?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }

    if (page < result.meta.totalPages) {
      links.push(`</api/reviews?page=${page + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @ApiResponse({ status: 200, description: 'Отзыв найден', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiResponse({ status: 201, description: 'Отзыв создан', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить отзыв' })
  @ApiResponse({ status: 200, description: 'Отзыв обновлён', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Загрузить фото к отзыву' })
  @ApiResponse({ status: 200, description: 'Фото загружено', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  uploadPhoto(
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
    return this.reviewsService.uploadPhoto(id, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiResponse({ status: 200, description: 'Отзыв удалён', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
