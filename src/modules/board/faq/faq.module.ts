import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Faq } from './entities/faq';
import { FaqController } from './Faq.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateFaqHandler } from './command/update-faq.handler';
import { DeleteFaqHandler } from './command/delete-faq.handler';
import { BoardFile } from '../../file/entities/board_file';
import { GetFaqDetailHandler } from './command/get-faq-detail.handler';
import { FaqCategory } from './entities/faq_category';
import { CreateFaqHandler } from './command/create-faq.handler';
import { GetCategoryListHandler } from './query/get-category-list.handler';
import { GetFaqListHandler } from './query/get-faq-list.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Faq, BoardFile, FaqCategory]), CqrsModule],
  controllers: [FaqController],
  providers: [
    CreateFaqHandler,
    GetFaqDetailHandler,
    UpdateFaqHandler,
    DeleteFaqHandler,
    GetCategoryListHandler,
    GetFaqListHandler,
  ],
})
export class FaqModule {}
