import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { ProductType } from './gql/product.type';
import { CreateProductInput, UpdateProductInput } from './gql/product.input';
import { PaginatedProducts } from './gql/paginated-products.type';
import { PaginationArgs } from '../graphql/pagination.args';
import { ReviewType } from '../reviews/gql/review.type';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginated } from '../graphql/paginated.type';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

@UseInterceptors(TimingInterceptor)
@Resolver(() => ProductType)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => PaginatedProducts, { name: 'products', complexity: ({ childComplexity }) => childComplexity * 2 })
  async findAll(@Args() { page, limit }: PaginationArgs): Promise<IPaginated<ProductType>> {
    const { data, meta } = await this.productsService.findAllPaginated(page, limit);
    return { data, total: meta.total, page, totalPages: meta.totalPages };
  }

  @Query(() => ProductType, { name: 'product' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductType)
  createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductType)
  updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => ProductType)
  deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.remove(id);
  }

  @Mutation(() => ProductType)
  publishProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.publish(id);
  }

  @Mutation(() => ProductType)
  hideProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.hide(id);
  }

  @ResolveField('reviews', () => [ReviewType])
  reviews(@Parent() product: ProductType) {
    return this.prisma.review.findMany({
      where: { productId: product.id },
      include: { user: true },
    });
  }
}
