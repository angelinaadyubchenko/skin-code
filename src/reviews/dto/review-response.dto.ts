import { ApiProperty } from '@nestjs/swagger';

export class ReviewUserDto {
  @ApiProperty({ example: 'uuid-пользователя' })
  id: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name: string;
}

export class ReviewProductDto {
  @ApiProperty({ example: 'uuid-товара' })
  id: string;

  @ApiProperty({ example: 'Увлажняющий крем' })
  name: string;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 'uuid-отзыва' })
  id: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Отличный товар!', nullable: true })
  comment: string | null;

  @ApiProperty({ example: 'https://bucket.storage.yandexcloud.net/reviews/uuid.jpg', nullable: true })
  photoUrl: string | null;

  @ApiProperty({ type: ReviewUserDto, nullable: true })
  user: ReviewUserDto | null;

  @ApiProperty({ type: ReviewProductDto, nullable: true })
  product: ReviewProductDto | null;
}

export class PaginatedReviewsResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  data: ReviewResponseDto[];

  @ApiProperty({
    example: { total: 100, page: 1, limit: 10, totalPages: 10 },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
