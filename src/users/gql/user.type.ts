import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

export { UserRole };
registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  createdAt?: Date;
}
