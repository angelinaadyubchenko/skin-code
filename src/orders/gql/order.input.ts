import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsArray, IsInt, Min, ArrayMinSize } from 'class-validator';
import { OrderStatus } from './order.type';

@InputType()
export class CreateOrderInput {
  @Field()
  @IsString()
  userId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  productIds: string[];

  @Field(() => [Int])
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  quantities: number[];
}

@InputType()
export class UpdateOrderInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}
