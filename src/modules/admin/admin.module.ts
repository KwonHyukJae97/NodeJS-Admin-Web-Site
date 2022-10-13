import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../account/admin/entities/admin';
import { SignUpAdminHandler } from '../account/auth/command/signup-admin.handler';
import { Account } from '../account/entities/account';

import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Admin]), CqrsModule],
  controllers: [AdminController],
  providers: [SignUpAdminHandler],
})
export class AdminModule {}
