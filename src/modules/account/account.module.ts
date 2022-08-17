import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Account} from "./entities/account.entity";
import {CqrsModule} from "@nestjs/cqrs";
import {CreateAccountHandler} from "./handler/create-account.handler";

@Module({
  imports: [TypeOrmModule.forFeature([Account]), CqrsModule],
  controllers: [AccountController],
  providers: [AccountService, CreateAccountHandler],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
