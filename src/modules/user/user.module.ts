import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Account } from '../account/entities/account.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './command/create-user.handler';
import { GetUserInfoQueryHandler } from './query/get-user-info.handler';
import { GetAllUserQueryHandler } from './query/get-all-user.handler';
import { DeleteUserHandler } from './command/deleate-user.handler';
import { UpdateUserHandler } from './command/update-user.handler';
import { AccountFile } from '../account/file/entities/account-file';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/common/utils/multer.options';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler, DeleteUserHandler];
const QueryHandlers = [GetUserInfoQueryHandler, GetAllUserQueryHandler];
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, AccountFile]),
    CqrsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}
