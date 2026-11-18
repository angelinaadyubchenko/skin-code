import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { OrderType } from './gql/order.type';
import { OrderItemType } from './gql/order-item.type';
import { CreateOrderInput, UpdateOrderInput } from './gql/order.input';
import { PaginatedOrders } from './gql/paginated-orders.type';
import { PaginationArgs } from '../graphql/pagination.args';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginated } from '../graphql/paginated.type';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

@UseInterceptors(TimingInterceptor)
@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => PaginatedOrders, { name: 'orders', complexity: ({ childComplexity }) => childComplexity * 2 })
  async findAll(@Args() { page, limit }: PaginationArgs): Promise<IPaginated<OrderType>> {
    const { data, meta } = await this.ordersService.findAllPaginated(page, limit);
    return { data, total: meta.total, page, totalPages: meta.totalPages };
  }

  @Query(() => OrderType, { name: 'order' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => OrderType)
  createOrder(@Args('input') input: CreateOrderInput) {
    return this.ordersService.create(input);
  }

  @Mutation(() => OrderType)
  updateOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOrderInput,
  ) {
    return this.ordersService.update(id, input);
  }

  @Mutation(() => OrderType)
  deleteOrder(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.remove(id);
  }

  @Mutation(() => OrderType)
  confirmOrder(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.confirm(id);
  }

  @Mutation(() => OrderType)
  shipOrder(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.ship(id);
  }

  @Mutation(() => OrderType)
  deliverOrder(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.deliver(id);
  }

  @Mutation(() => OrderType)
  cancelOrder(@Args('id', { type: () => ID }) id: string) {
    return this.ordersService.cancel(id);
  }

  @ResolveField('items', () => [OrderItemType])
  items(@Parent() order: OrderType) {
    return this.prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: { include: { category: true } } },
    });
  }
}
