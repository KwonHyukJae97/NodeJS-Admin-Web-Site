import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account';
import { AdminController } from './admin.controller';
import { SignUpAdminHandler } from './command/signup-admin.handler';
import { Admin } from './entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Admin]), CqrsModule],
  controllers: [AdminController],
  providers: [SignUpAdminHandler],
})
export class AdminModule {}
