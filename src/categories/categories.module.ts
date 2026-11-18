import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesApiController } from './categories.api.controller';
import { CategoriesResolver } from './categories.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, CategoriesApiController],
  providers: [CategoriesService, CategoriesResolver],
  exports: [CategoriesService],
})
export class CategoriesModule {}