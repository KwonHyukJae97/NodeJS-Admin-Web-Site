import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileCreateEventsHandler } from '../faq/event/file-create-events.handler';
import { FileUpdateEventsHandler } from '../faq/event/file-update-events.handler';
import { FileDeleteEventsHandler } from '../faq/event/file-delete-events.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { GetAllFileDownloadHandler } from './query/get-files-download.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { FileController } from './file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile]), CqrsModule],
  controllers: [FileController],
  providers: [
    FileService,
    FileCreateEventsHandler,
    FileUpdateEventsHandler,
    FileDeleteEventsHandler,
    GetFileDownloadHandler,
    GetAllFileDownloadHandler,
  ],
})
export class FileModule {}
