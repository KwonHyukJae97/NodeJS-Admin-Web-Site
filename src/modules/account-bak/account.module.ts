import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account3 } from './entities/account.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { Account } from '../account/entities/account';

@Module({
  imports: [TypeOrmModule.forFeature([Account3, Account]), CqrsModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
