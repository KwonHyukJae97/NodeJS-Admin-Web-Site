import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temporary } from '../temporary/entities/temporary';
import { AccountContoller } from './account.controller';
import { Account } from './entities/account.entity';
import { GetAccountHandler } from './query/get-account.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Temporary]), CqrsModule],
  controllers: [AccountContoller],
  providers: [GetAccountHandler],
})
export class AccountModule {}
