import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsApiController } from './products.api.controller';
import { ProductsResolver } from './products.resolver';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module, CacheModule.register({ ttl: 5000 })],
  controllers: [ProductsController, ProductsApiController],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}