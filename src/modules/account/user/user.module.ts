import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignUpUserHandler } from '../auth/command/signup-user.handler';
import { Account } from '../entities/account';
import { User } from './entities/user';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account, User]), CqrsModule],
  controllers: [UserController],
  providers: [SignUpUserHandler],
})
export class UserModule {}
