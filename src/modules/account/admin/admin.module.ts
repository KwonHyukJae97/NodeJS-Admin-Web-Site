import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignUpAdminHandler } from '../auth/command/signup-admin.handler';
import { Account2 } from '../entities/account';
import { AdminController } from './admin.controller';
import { Admin } from './entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Account2, Admin]), CqrsModule],
  controllers: [AdminController],
  providers: [SignUpAdminHandler],
})
export class AdminModule {}
