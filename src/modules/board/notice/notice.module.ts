import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Notice } from './entities/notice';
import { NoticeController } from './notice.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNoticeHandler } from './command/create-notice.handler';
import { UpdateNoticeHandler } from './command/update-notice.handler';
import { DeleteNoticeHandler } from './command/delete-notice.handler';
import { BoardFile } from '../../file/entities/board-file';
import { GetNoticeListHandler } from './query/get-notice-list.handler';
import { BoardFileDb } from '../board-file-db';
import { GetNoticeDetailHandler } from './command/get-notice-detail.handler';
import { ConvertException } from '../../../common/utils/convert-exception';

const CommandHandlers = [
  CreateNoticeHandler,
  UpdateNoticeHandler,
  DeleteNoticeHandler,
  GetNoticeDetailHandler,
];
const QueryHandlers = [GetNoticeListHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice, BoardFile]), CqrsModule],
  controllers: [NoticeController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ConvertException,
    { provide: 'noticeFile', useClass: BoardFileDb },
  ],
})
export class NoticeModule {}
