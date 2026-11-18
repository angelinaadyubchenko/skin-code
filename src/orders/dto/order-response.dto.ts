import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UserShortDto {
  @ApiProperty({ example: 'uuid-пользователя' })
  id: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class OrderItemResponseDto {
  @ApiProperty({ example: 'uuid-позиции' })
  id: string;

  @ApiProperty({ example: 'uuid-товара' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 2400 })
  price: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'uuid-заказа' })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 4800 })
  totalPrice: number;

  @ApiProperty({ type: UserShortDto, nullable: true })
  user: UserShortDto | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

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
