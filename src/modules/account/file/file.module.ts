import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from 'src/modules/board/file.controller';
import { Account } from '../entities/account.entity';
import { AccountFile } from './entities/account-file';
import { FileService } from './file.service';
import { FileUpdateEventsHandler } from '../../user/event/file-update-events-handler';
import { FileDeleteEventsHandler } from '../../user/event/file-delete-events-handler';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountFile])],
  controllers: [FileController],
  providers: [FileService, FileUpdateEventsHandler, FileDeleteEventsHandler],
})
export class FileModule {}
