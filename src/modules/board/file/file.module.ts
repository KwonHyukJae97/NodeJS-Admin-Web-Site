import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { NoticeFileCreateEventsHandler } from '../notice/event/file-create-events.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllFileDownloadHandler } from './query/get-files-download.handler';
import { QnaFileCreateEventsHandler } from '../qna/event/file-create-events.handler';
import { QnaFileUpdateEventsHandler } from '../qna/event/file-update-events.handler';
import { QnaFileDeleteEventsHandler } from '../qna/event/file-delete-events.handler';
import { NoticeFileDeleteEventsHandler } from '../notice/event/file-delete-events.handler';
import { NoticeFileUpdateEventsHandler } from '../notice/event/file-update-events.handler';
import { FaqFileCreateEventsHandler } from '../faq/event/file-create-events.handler';
import { FaqFileDeleteEventsHandler } from '../faq/event/file-delete-events.handler';
import { FaqFileUpdateEventsHandler } from '../faq/event/file-update-events.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile]), CqrsModule],
  controllers: [FileController],
  providers: [
    FileService,
    NoticeFileCreateEventsHandler,
    FaqFileCreateEventsHandler,
    QnaFileCreateEventsHandler,
    NoticeFileUpdateEventsHandler,
    FaqFileUpdateEventsHandler,
    QnaFileUpdateEventsHandler,
    NoticeFileDeleteEventsHandler,
    FaqFileDeleteEventsHandler,
    QnaFileDeleteEventsHandler,
    GetFileDownloadHandler,
    GetAllFileDownloadHandler,
  ],
})
export class FileModule {}
