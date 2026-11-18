import { ApiProperty } from '@nestjs/swagger';

export class CategoryShortDto {
  @ApiProperty({ example: 'uuid-категории' })
  id: string;

  @ApiProperty({ example: 'Уход за лицом' })
  name: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-товара' })
  id: string;

  @ApiProperty({ example: 'Увлажняющий крем' })
  name: string;

  @ApiProperty({ example: 'Описание товара', nullable: true })
  description: string | null;

  @ApiProperty({ example: 1200 })
  price: number;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ type: CategoryShortDto, nullable: true })
  category: CategoryShortDto | null;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

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