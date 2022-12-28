import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Qna } from './entities/qna';
import { QnaController } from './qna.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateQnaHandler } from './command/create-qna.handler';
import { GetQnaListHandler } from './query/get-qna-list.handler';
import { UpdateQnaHandler } from './command/update-qna.handler';
import { DeleteQnaHandler } from './command/delete-qna.handler';
import { BoardFile } from '../../file/entities/board-file';
import { GetQnaDetailHandler } from './command/get-qna-detail.handler';
import { Comment } from '../comment/entities/comment';
import { BoardFileDb } from '../board-file-db';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Account } from '../../account/entities/account';
import { Admin } from '../../account/admin/entities/admin';

const CommandHandlers = [CreateQnaHandler, UpdateQnaHandler, DeleteQnaHandler, GetQnaDetailHandler];
const QueryHandlers = [GetQnaListHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Board, Qna, BoardFile, Comment, Account, Admin]), CqrsModule],
  controllers: [QnaController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ConvertException,
    { provide: 'boardFile', useClass: BoardFileDb },
  ],
})
export class QnaModule {}
