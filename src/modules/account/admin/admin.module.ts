import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignUpAdminHandler } from '../auth/command/signup-admin.handler';
import { Account } from '../entities/account.entity';
import { AdminController } from './admin.controller';
import { CreateAdminhandler } from './command/create-admin.handler';
import { DeleteAdminHandler } from './command/delete-admin.handler';
import { UpdateAdminHandler } from './command/update-admin.handler';
import { GetAdminInfoQueryHandler } from './query/get-admin-info.handler';
import { GetAllAdminQueryHandler } from './query/get-all-admin.handler';
import { AccountFileDb } from '../account-file-db';
import { AccountFile } from '../../file/entities/account-file.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { Admin } from './entities/admin.entity';

const CommandHandler = [
  SignUpAdminHandler,
  CreateAdminhandler,
  UpdateAdminHandler,
  DeleteAdminHandler,
];
const QueryHandler = [GetAdminInfoQueryHandler, GetAllAdminQueryHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Account, Admin, AccountFile, Company]), CqrsModule],
  controllers: [AdminController],

  providers: [
    ...CommandHandler,
    ...QueryHandler,
    ConvertException,
    { provide: 'accountFile', useClass: AccountFileDb },
  ],
})
export class AdminModule {}
