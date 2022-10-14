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

@Module({
  imports: [TypeOrmModule.forFeature([Board, Qna, BoardFile, Comment]), CqrsModule],
  controllers: [QnaController],
  providers: [
    CreateQnaHandler,
    GetQnaListHandler,
    GetQnaDetailHandler,
    UpdateQnaHandler,
    DeleteQnaHandler,
    { provide: 'qnaFile', useClass: BoardFileDb },
  ],
})
export class QnaModule {}
