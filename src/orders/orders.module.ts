import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersApiController } from './orders.api.controller';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController, OrdersApiController],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}