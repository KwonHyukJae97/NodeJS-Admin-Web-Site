import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
// import { AccountFileDb } from '../account/account-file-db'
import { WordLevel } from './entities/wordLevel.entity';
import { CreateWordLevelHandler } from './command/create-wordLevel.handler';
import { DeleteWordLevelHandler } from './command/delete-wordLevel.handler';
import { UpdateWordLevelHandler } from './command/update-wordLevel.handler';
import { GetWordLevelListQueryHandler } from './query/get-wordLevel-list.handler';
import { WordLevelController } from './wordLevel.controller';

const CommandHandler = [CreateWordLevelHandler, UpdateWordLevelHandler, DeleteWordLevelHandler];

const QueryHandler = [GetWordLevelListQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([WordLevel]), CqrsModule],
  controllers: [WordLevelController],

  providers: [...CommandHandler, ...QueryHandler, ConvertException],
})
export class WordLevelModule {}
