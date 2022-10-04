import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Faq } from './entities/faq';
import { FaqController } from './Faq.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetFaqInfoHandler } from './query/get-faq-info.handler';
import { UpdateFaqHandler } from './command/update-faq.handler';
import { DeleteFaqHandler } from './command/delete-faq.handler';
import { BoardFile } from '../file/entities/board_file';
import { GetFaqDetailHandler } from './command/get-faq-detail.handler';
import { GetFaqSearchHandler } from './query/get-faq-search.handler';
import { FaqCategory } from './entities/faq_category';
import { CreateFaqHandler } from './command/create-faq.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Faq, BoardFile, FaqCategory]), CqrsModule],
  controllers: [FaqController],
  providers: [
    CreateFaqHandler,
    GetFaqInfoHandler,
    GetFaqDetailHandler,
    UpdateFaqHandler,
    DeleteFaqHandler,
    GetFaqSearchHandler,
  ],
})
export class FaqModule {}
