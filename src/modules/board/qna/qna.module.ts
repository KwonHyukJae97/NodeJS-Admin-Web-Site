import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Qna } from './entities/qna';
import { QnaController } from './qna.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateQnaHandler } from './command/create-qna.handler';
import { GetQnaInfoHandler } from './query/get-qna-info.handler';
import { UpdateQnaHandler } from './command/update-qna.handler';
import { DeleteQnaHandler } from './command/delete-qna.handler';
import { BoardFile } from '../file/entities/board_file';
import { GetQnaDetailHandler } from './command/get-qna-detail.handler';
import { GetQnaSearchHandler } from './query/get-qna-search.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Qna, BoardFile]), CqrsModule],
  controllers: [QnaController],
  providers: [
    CreateQnaHandler,
    GetQnaInfoHandler,
    GetQnaDetailHandler,
    UpdateQnaHandler,
    DeleteQnaHandler,
    GetQnaSearchHandler,
  ],
})
export class QnaModule {}
