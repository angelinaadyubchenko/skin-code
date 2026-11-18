import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { CategoryType } from '../../categories/gql/category.type';

@ObjectType()
export class ProductType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  published?: boolean;

  @Field(() => String, { nullable: true })
  imageUrl?: string | null;

  @Field()
  categoryId: string;

  @Field(() => CategoryType, { nullable: true })
  category?: CategoryType;
}
