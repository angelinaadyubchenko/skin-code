import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { CategoryType } from './gql/category.type';
import { CreateCategoryInput, UpdateCategoryInput } from './gql/category.input';
import { PaginatedCategories } from './gql/paginated-categories.type';
import { PaginationArgs } from '../graphql/pagination.args';
import { ProductType } from '../products/gql/product.type';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginated } from '../graphql/paginated.type';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

@UseInterceptors(TimingInterceptor)
@Resolver(() => CategoryType)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => PaginatedCategories, { name: 'categories', complexity: ({ childComplexity }) => childComplexity * 2 })
  async findAll(@Args() { page, limit }: PaginationArgs): Promise<IPaginated<CategoryType>> {
    const { data, meta } = await this.categoriesService.findAllPaginated(page, limit);
    return { data, total: meta.total, page, totalPages: meta.totalPages };
  }

  @Query(() => CategoryType, { name: 'category' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => CategoryType)
  createCategory(@Args('input') input: CreateCategoryInput) {
    return this.categoriesService.create(input);
  }

  @Mutation(() => CategoryType)
  updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(id, input);
  }

  @Mutation(() => CategoryType)
  deleteCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoriesService.remove(id);
  }

  @ResolveField('products', () => [ProductType])
  products(@Parent() category: CategoryType) {
    return this.prisma.product.findMany({ where: { categoryId: category.id } });
  }
}
