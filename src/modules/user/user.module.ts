import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/modules/user/user.controller';
import { Account } from '../account/entities/account';
import { SignUpUserHandler } from './command/signup-user.handler';
import { User } from './entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([Account, User]), CqrsModule],
  controllers: [UserController],
  providers: [SignUpUserHandler],
})
export class UserModule {}
