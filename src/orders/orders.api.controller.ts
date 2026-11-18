import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  OrderItemResponseDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersApiController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список заказов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список заказов', type: PaginatedOrdersResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Параметры page и limit должны быть больше 0');
    }

    const result = await this.ordersService.findAllPaginated(page, limit);
    const links: string[] = [];

    if (page > 1) {
      links.push(`</api/orders?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }

    if (page < result.meta.totalPages) {
      links.push(`</api/orders?page=${page + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiResponse({ status: 200, description: 'Заказ найден', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Получить все позиции заказа' })
  @ApiResponse({ status: 200, description: 'Список позиций заказа', type: [OrderItemResponseDto] })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  getItems(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findItems(id);
  }

  @Get(':id/items/:itemId')
  @ApiOperation({ summary: 'Получить конкретную позицию заказа' })
  @ApiResponse({ status: 200, description: 'Позиция заказа найдена', type: OrderItemResponseDto })
  @ApiResponse({ status: 404, description: 'Заказ или позиция не найдены' })
  getItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.ordersService.findItem(id, itemId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать заказ' })
  @ApiResponse({ status: 201, description: 'Заказ создан', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить статус заказа' })
  @ApiResponse({ status: 200, description: 'Заказ обновлён', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заказ' })
  @ApiResponse({ status: 200, description: 'Заказ удалён', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
