import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board.entity';
import { Comment } from './entities/comment';
import { CommentController } from './comment.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCommentHandler } from './command/create-comment.handler';
import { GetCommentListHandler } from './query/get-comment-list.handler';
import { UpdateCommentHandler } from './command/update-comment.handler';
import { BoardFile } from '../../file/entities/board-file.entity';
import { GetCommentDetailHandler } from './command/get-comment-detail.handler';
import { Qna } from '../qna/entities/qna.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Admin } from '../../account/admin/entities/admin';
import { Company } from '../../company/entities/company.entity';
import { Account } from '../../account/entities/account';
import { UserCompany } from '../../account/user/entities/user-company';
import { User } from '../../account/user/entities/user';

const CommandHandlers = [CreateCommentHandler, UpdateCommentHandler, GetCommentDetailHandler];
const QueryHandlers = [GetCommentListHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      Comment,
      BoardFile,
      Qna,
      Admin,
      Company,
      Account,
      UserCompany,
      User,
    ]),
    CqrsModule,
  ],
  controllers: [CommentController],
  providers: [...CommandHandlers, ...QueryHandlers, ConvertException],
})
export class CommentModule {}
