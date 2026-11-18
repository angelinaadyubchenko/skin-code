import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const toArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
};

const toNumberArray = ({ value }: { value: unknown }) => {
  const array = toArray({ value });
  return array.map((item) => Number(item));
};

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ example: ['uuid-товара-1', 'uuid-товара-2'], type: [String] })
  @Transform(toArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ example: [2, 1], type: [Number] })
  @Transform(toNumberArray)
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  quantities: number[];
}
