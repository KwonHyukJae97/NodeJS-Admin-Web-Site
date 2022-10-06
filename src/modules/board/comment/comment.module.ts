import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Comment } from './entities/comment';
import { CommentController } from './comment.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCommentHandler } from './command/create-comment.handler';
import { GetCommentInfoHandler } from './query/get-comment-info.handler';
import { UpdateCommentHandler } from './command/update-comment.handler';
import { BoardFile } from '../file/entities/board_file';
import { GetCommentDetailHandler } from './command/get-comment-detail.handler';
import { GetCommentSearchHandler } from './query/get-comment-search.handler';
import { Qna } from '../qna/entities/qna';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Comment, BoardFile, Qna]), CqrsModule],
  controllers: [CommentController],
  providers: [
    CreateCommentHandler,
    GetCommentInfoHandler,
    GetCommentDetailHandler,
    UpdateCommentHandler,
    GetCommentSearchHandler,
  ],
})
export class CommentModule {}
