import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../graphql/paginated.type';
import { OrderType } from './order.type';

@ObjectType()
export class PaginatedOrders extends Paginated(OrderType) {}
