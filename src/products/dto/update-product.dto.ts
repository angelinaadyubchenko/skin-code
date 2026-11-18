import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Увлажняющий крем', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Описание товара', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1200, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'uuid-категории', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;
}