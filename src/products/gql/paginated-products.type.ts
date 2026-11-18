import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../graphql/paginated.type';
import { ProductType } from './product.type';

@ObjectType()
export class PaginatedProducts extends Paginated(ProductType) {}
