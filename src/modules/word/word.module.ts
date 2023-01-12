import { Module } from '@nestjs/common';
import { WordController } from './word.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WordFile } from '../file/entities/word-file.entity';
import { Word } from './entities/word.entity';
import { ConvertException } from '../../common/utils/convert-exception';
import { CreateWordHandler } from './command/create-word.handler';
import { GetWordListHandler } from './query/get-word-list.handler';
import { Example } from './entities/example.entity';
import { SimilarWord } from './entities/similar-word.entity';
import { WordFileDb } from './word-file-db';
import { GetDuplicateWordListHandler } from './query/get-duplicate-word-list.handler';
import { GetOriginWordListHandler } from './query/get-origin-word-list.handler';
import { UpdateWordHandler } from './command/update-word.handler';

const CommandHandlers = [CreateWordHandler, UpdateWordHandler];

const QueryHandlers = [GetWordListHandler, GetDuplicateWordListHandler, GetOriginWordListHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Word, WordFile, Example, SimilarWord]), CqrsModule],
  controllers: [WordController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ConvertException,
    { provide: 'wordFile', useClass: WordFileDb },
  ],
})
export class WordModule {}
