import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/modules/account/user/user.controller';
import { SignUpUserHandler } from '../auth/command/signup-user.handler';
import { Account } from '../entities/account';
import { User } from './entities/user';
import { GetUserInfoQueryHandler } from './query/get-user-info.handler';
import { GetAllUserQueryHandler } from './query/get-all-user.handler';
import { DeleteUserHandler } from './command/delete-user.handler';
import { UpdateUserHandler } from './command/update-user.handler';
import { ConvertException } from 'src/common/utils/convert-exception';

const CommandHandlers = [SignUpUserHandler, UpdateUserHandler, DeleteUserHandler];
const QueryHandlers = [GetUserInfoQueryHandler, GetAllUserQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([Account, User]), CqrsModule],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers, ConvertException],
})
export class UserModule {}
