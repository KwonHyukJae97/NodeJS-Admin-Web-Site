import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Account } from '../account.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './command/create-user.handler';
import { GetUserInfoQueryHandler } from './query/get-user-info.handler';
import { GetAllUserQueryHandler } from './query/get-all-user.handler';

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserInfoQueryHandler, GetAllUserQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Account]), CqrsModule],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}
