import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entity';
import { Temporary } from './entities/temporary';
import { GetTemporaryHandler } from './query/get-temporary.handler';

import { TemporaryController } from './temporary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Temporary]), CqrsModule],
  controllers: [TemporaryController],
  providers: [GetTemporaryHandler],
})
export class TemporaryModule {}
