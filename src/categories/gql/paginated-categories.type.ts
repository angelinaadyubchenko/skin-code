import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../graphql/paginated.type';
import { CategoryType } from './category.type';

@ObjectType()
export class PaginatedCategories extends Paginated(CategoryType) {}
