import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@prisma/client';
import { UserType } from '../../users/gql/user.type';
import { OrderItemType } from './order-item.type';

export { OrderStatus };

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class OrderType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => [OrderItemType], { nullable: true })
  items?: OrderItemType[];
}
