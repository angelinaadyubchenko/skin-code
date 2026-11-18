import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { ReviewType } from './gql/review.type';
import { CreateReviewInput, UpdateReviewInput } from './gql/review.input';
import { PaginatedReviews } from './gql/paginated-reviews.type';
import { PaginationArgs } from '../graphql/pagination.args';
import { IPaginated } from '../graphql/paginated.type';
import { TimingInterceptor } from '../interceptors/timing.interceptor';

@UseInterceptors(TimingInterceptor)
@Resolver(() => ReviewType)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => PaginatedReviews, { name: 'reviews', complexity: ({ childComplexity }) => childComplexity * 2 })
  async findAll(@Args() { page, limit }: PaginationArgs): Promise<IPaginated<ReviewType>> {
    const { data, meta } = await this.reviewsService.findAllPaginated(page, limit);
    return { data, total: meta.total, page, totalPages: meta.totalPages };
  }

  @Query(() => ReviewType, { name: 'review' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Mutation(() => ReviewType)
  createReview(@Args('input') input: CreateReviewInput) {
    return this.reviewsService.create(input);
  }

  @Mutation(() => ReviewType)
  updateReview(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateReviewInput,
  ) {
    return this.reviewsService.update(id, input);
  }

  @Mutation(() => ReviewType)
  deleteReview(@Args('id', { type: () => ID }) id: string) {
    return this.reviewsService.remove(id);
  }
}
