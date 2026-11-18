import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Увлажняющий крем' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Описание товара', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1200 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'uuid-категории' })
  @IsString()
  categoryId: string;
}