import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board.entity';
import { Faq } from './entities/faq.entity';
import { FaqController } from './faq.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateFaqHandler } from './command/update-faq.handler';
import { DeleteFaqHandler } from './command/delete-faq.handler';
import { BoardFile } from '../../file/entities/board-file.entity';
import { GetFaqDetailHandler } from './command/get-faq-detail.handler';
import { FaqCategory } from './entities/faq_category.entity';
import { CreateFaqHandler } from './command/create-faq.handler';
import { GetCategoryListHandler } from './query/get-category-list.handler';
import { GetFaqListHandler } from './query/get-faq-list.handler';
import { BoardFileDb } from '../board-file-db';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Account } from '../../account/entities/account.entity';

const CommandHandlers = [CreateFaqHandler, UpdateFaqHandler, DeleteFaqHandler, GetFaqDetailHandler];
const QueryHandlers = [GetFaqListHandler, GetCategoryListHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Board, Faq, BoardFile, FaqCategory, Account]), CqrsModule],
  controllers: [FaqController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ConvertException,
    { provide: 'boardFile', useClass: BoardFileDb },
  ],
})
export class FaqModule {}
