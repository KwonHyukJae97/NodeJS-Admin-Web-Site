import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileCreateEventsHandler } from '../notice/event/file-create-events.handler';
import { FileUpdateEventsHandler } from '../notice/event/file-update-events.handler';
import { FileDeleteEventsHandler } from '../notice/event/file-delete-events.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllFileDownloadHandler } from './query/get-files-download.handler';
import { QnaFileCreateEventsHandler } from '../qna/event/file-create-events.handler';
import { QnaFileUpdateEventsHandler } from '../qna/event/file-update-events.handler';
import { QnaFileDeleteEventsHandler } from '../qna/event/file-delete-events.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile]), CqrsModule],
  controllers: [FileController],
  providers: [
    FileService,
    FileCreateEventsHandler,
    QnaFileCreateEventsHandler,
    FileUpdateEventsHandler,
    QnaFileUpdateEventsHandler,
    FileDeleteEventsHandler,
    QnaFileDeleteEventsHandler,
    GetFileDownloadHandler,
    GetAllFileDownloadHandler,
  ],
})
export class FileModule {}
