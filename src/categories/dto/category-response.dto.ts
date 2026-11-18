import { ApiProperty } from '@nestjs/swagger';

export class ProductInCategoryDto {
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
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid-категории' })
  id: string;

  @ApiProperty({ example: 'Уход за лицом' })
  name: string;

  @ApiProperty({ type: [ProductInCategoryDto] })
  products: ProductInCategoryDto[];
}

export class PaginatedCategoriesResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

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
