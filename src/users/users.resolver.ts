import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserType } from './gql/user.type';
import { CreateUserInput, UpdateUserInput } from './gql/user.input';
import { PaginatedUsers } from './gql/paginated-users.type';
import { PaginationArgs } from '../graphql/pagination.args';
import { OrderType } from '../orders/gql/order.type';
import { ReviewType } from '../reviews/gql/review.type';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginated } from '../graphql/paginated.type';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

@UseInterceptors(TimingInterceptor)
@Resolver(() => UserType)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => PaginatedUsers, { name: 'users', complexity: ({ childComplexity }) => childComplexity * 2 })
  async findAll(@Args() { page, limit }: PaginationArgs): Promise<IPaginated<UserType>> {
    const { data, meta } = await this.usersService.findAllPaginated(page, limit);
    return { data, total: meta.total, page, totalPages: meta.totalPages };
  }

  @Query(() => UserType, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserType)
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => UserType)
  deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }

  @ResolveField('orders', () => [OrderType])
  orders(@Parent() user: UserType) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
  }

  @ResolveField('reviews', () => [ReviewType])
  reviews(@Parent() user: UserType) {
    return this.prisma.review.findMany({
      where: { userId: user.id },
      include: { product: { include: { category: true } } },
    });
  }
}
