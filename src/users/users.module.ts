import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersApiController } from './users.api.controller';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, UsersApiController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}