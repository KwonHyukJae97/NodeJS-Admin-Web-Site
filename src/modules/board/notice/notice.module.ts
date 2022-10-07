import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Notice } from './entities/notice';
import { NoticeController } from './notice.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNoticeHandler } from './command/create-notice.handler';
import { UpdateNoticeHandler } from './command/update-notice.handler';
import { DeleteNoticeHandler } from './command/delete-notice.handler';
import { BoardFile } from '../file/entities/board_file';
import { GetNoticeDetailHandler } from './command/get-notice-detail.handler';
import { GetNoticeSearchHandler } from './query/get-notice-search.handler';
import { GetNoticeListHandler } from './query/get-notice-list.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice, BoardFile]), CqrsModule],
  controllers: [NoticeController],
  providers: [
    CreateNoticeHandler,
    GetNoticeListHandler,
    GetNoticeDetailHandler,
    UpdateNoticeHandler,
    DeleteNoticeHandler,
    GetNoticeSearchHandler,
  ],
})
export class NoticeModule {}
