import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board.entity';
import { Notice } from './entities/notice.entity';
import { NoticeController } from './notice.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNoticeHandler } from './command/create-notice.handler';
import { UpdateNoticeHandler } from './command/update-notice.handler';
import { DeleteNoticeHandler } from './command/delete-notice.handler';
import { BoardFile } from '../../file/entities/board-file.entity';
import { GetNoticeListHandler } from './query/get-notice-list.handler';
import { BoardFileDb } from '../board-file-db';
import { GetNoticeDetailHandler } from './command/get-notice-detail.handler';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Account } from '../../account/entities/account.entity';
import { CreateFilesHandler } from '../../file/command/create-files.handler';
import { FileService } from '../../file/file.service';
import { UpdateFilesHandler } from '../../file/command/update-files.handler';
import { DeleteFilesHandler } from '../../file/command/delete-files.handler';

const CommandHandlers = [
  CreateNoticeHandler,
  UpdateNoticeHandler,
  DeleteNoticeHandler,
  GetNoticeDetailHandler,
  CreateFilesHandler,
  UpdateFilesHandler,
  DeleteFilesHandler,
];
const QueryHandlers = [GetNoticeListHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice, BoardFile, Account]), CqrsModule],
  controllers: [NoticeController],
  providers: [
    FileService,
    ...CommandHandlers,
    ...QueryHandlers,
    ConvertException,
    { provide: 'boardFile', useClass: BoardFileDb },
  ],
})
export class NoticeModule {}
