import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../graphql/paginated.type';
import { UserType } from './user.type';

@ObjectType()
export class PaginatedUsers extends Paginated(UserType) {}
