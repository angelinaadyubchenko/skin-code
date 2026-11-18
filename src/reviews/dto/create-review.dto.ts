import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'uuid-товара' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Отличный товар!', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}