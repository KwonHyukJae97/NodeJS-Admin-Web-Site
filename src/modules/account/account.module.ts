import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), CqrsModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
