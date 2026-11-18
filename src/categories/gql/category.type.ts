import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field()
  id: string;

  @Field()
  name: string;
}
