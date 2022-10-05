import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { Account2 } from '../account/entities/account';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Account2]), CqrsModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
