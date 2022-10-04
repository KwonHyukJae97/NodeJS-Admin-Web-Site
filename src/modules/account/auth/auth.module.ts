import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignController } from './auth.controller';
import { SignUpUserHandler } from './command/signup-user.handler';
import { SignUpAdminHandler } from './command/signup-admin.handler';
import { Admin } from '../admin/entities/admin';
import { User } from '../user/entities/user';
import { Account } from '../entities/account';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Admin, Account]), CqrsModule],
  controllers: [SignController],
  providers: [SignUpUserHandler, SignUpAdminHandler],
})
export class SecondAuthModule {}
