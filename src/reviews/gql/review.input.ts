import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  comment?: string;
}

@InputType()
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  comment?: string;
}
