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
import { OrderResponseDto } from '../orders/dto/order-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список пользователей', type: PaginatedUsersResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Параметры page и limit должны быть больше 0');
    }

    const result = await this.usersService.findAllPaginated(page, limit);
    const links: string[] = [];

    if (page > 1) {
      links.push(`</api/users?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }

    if (page < result.meta.totalPages) {
      links.push(`</api/users?page=${page + 1}&limit=${limit}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь найден', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Получить все заказы пользователя' })
  @ApiResponse({ status: 200, description: 'Список заказов пользователя', type: [OrderResponseDto] })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getOrders(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOrders(id);
  }

  @Get(':id/orders/:orderId')
  @ApiOperation({ summary: 'Получить конкретный заказ пользователя' })
  @ApiResponse({ status: 200, description: 'Заказ пользователя найден', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Пользователь или заказ не найдены' })
  getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.usersService.findOrder(id, orderId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлён', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удалён', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
