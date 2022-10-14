import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board';
import { BoardFile } from './entities/board-file';
import { CqrsModule } from '@nestjs/cqrs';
import { FileEventsHandler } from './event/file-events.handler';
import { GetAllFilesDownloadHandler } from './query/get-files-download.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { BoardFileDb } from '../board/board-file-db';
import { AccountFileDb } from '../account/account-file-db';
import { AccountFile } from './entities/account-file';
import { Account } from '../account/entities/account';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile, Account, AccountFile]), CqrsModule],
  controllers: [FileController],
  providers: [
    FileService,
    FileEventsHandler,
    GetAllFilesDownloadHandler,
    GetFileDownloadHandler,
    { provide: 'boardFile', useClass: BoardFileDb },
    { provide: 'accountFile', useClass: AccountFileDb },
  ],
})
export class FileModule {}
