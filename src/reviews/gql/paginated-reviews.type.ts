import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../graphql/paginated.type';
import { ReviewType } from './review.type';

@ObjectType()
export class PaginatedReviews extends Paginated(ReviewType) {}
