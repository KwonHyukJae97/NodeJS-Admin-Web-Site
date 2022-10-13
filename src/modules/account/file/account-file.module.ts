import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { AccountFile } from './entities/account-file';
import { FileService } from './file.service';
import { FileCreateEventsHandler } from '../../user/event/file-create-events.handler';
import { FileUpdateEventsHandler } from '../../user/event/file-update-events-handler';
import { FileDeleteEventsHandler } from '../../user/event/file-delete-events-handler';
import { FileController } from './file.controller';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountFile]), CqrsModule],
  controllers: [FileController],
  providers: [
    FileService,
    FileCreateEventsHandler,
    FileUpdateEventsHandler,
    FileDeleteEventsHandler,
  ],
})
export class AccountFileModule {}
