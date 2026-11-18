import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async hasReview(userId: string): Promise<boolean> {
    const count = await this.prisma.review.count({ where: { userId } });
    return count > 0;
  }

  async create(dto: CreateReviewDto) {
    const exists = await this.hasReview(dto.userId);
    if (exists) {
      throw new ConflictException('Вы уже оставили отзыв');
    }
    return this.prisma.review.create({
      data: {
        userId: dto.userId,
        productId: dto.productId,
        rating: Number(dto.rating),
        comment: dto.comment,
      },
      include: { user: true, product: true },
    });
  }

  findAll() {
    return this.prisma.review.findMany({
      include: { user: true, product: true },
    });
  } 

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        include: { user: true, product: true },
      }),
      this.prisma.review.count(),
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
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, product: true },
    });

    if (!review) {
      throw new NotFoundException(`Отзыв с id ${id} не найден`);
    }

    return review;
  }

  async update(id: string, dto: UpdateReviewDto) {
    await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: Number(dto.rating),
        comment: dto.comment,
      },
      include: { user: true, product: true },
    });
  }

  async uploadPhoto(id: string, file: Express.Multer.File) {
    const review = await this.findOne(id);

    if (review.photoUrl) {
      await this.s3.delete(review.photoUrl);
    }

    const photoUrl = await this.s3.upload(file, 'reviews');

    return this.prisma.review.update({
      where: { id },
      data: { photoUrl },
      include: { user: true, product: true },
    });
  }

  async remove(id: string) {
    const review = await this.findOne(id);

    if (review.photoUrl) {
      await this.s3.delete(review.photoUrl);
    }

    return this.prisma.review.delete({
      where: { id },
      include: { user: true, product: true },
    });
  }
}
