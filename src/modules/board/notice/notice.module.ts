import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Notice } from './entities/notice';
import { NoticeController } from './notice.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNoticeHandler } from './command/create-notice.handler';
import { UpdateNoticeHandler } from './command/update-notice.handler';
import { DeleteNoticeHandler } from './command/delete-notice.handler';
import { BoardFile } from '../../file/entities/board_file';
import { GetNoticeListHandler } from './query/get-notice-list.handler';
import { BoardFileDb } from '../board-file-db';
import { GetNoticeDetailHandler } from './command/get-notice-detail.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice, BoardFile]), CqrsModule],
  controllers: [NoticeController],
  providers: [
    CreateNoticeHandler,
    GetNoticeListHandler,
    UpdateNoticeHandler,
    DeleteNoticeHandler,
    GetNoticeDetailHandler,
    { provide: 'noticeFile', useClass: BoardFileDb },
  ],
})
export class NoticeModule {}
