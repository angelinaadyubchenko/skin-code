import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserType } from '../../users/gql/user.type';
import { ProductType } from '../../products/gql/product.type';

@ObjectType()
export class ReviewType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  productId: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  @Field(() => String, { nullable: true, description: 'URL фото в Яндекс.Облаке' })
  photoUrl?: string | null;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => ProductType, { nullable: true })
  product?: ProductType;
}
