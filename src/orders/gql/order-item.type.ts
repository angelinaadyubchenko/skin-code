import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ProductType } from '../../products/gql/product.type';

@ObjectType()
export class OrderItemType {
  @Field()
  id: string;

  @Field()
  orderId: string;

  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => ProductType, { nullable: true })
  product?: ProductType;
}
