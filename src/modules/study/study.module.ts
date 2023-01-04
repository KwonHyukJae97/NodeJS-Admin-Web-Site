import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { StudyType } from '../studyType/entities/studyType';
import { WordLevel } from '../wordLevel/entities/wordLevel';
import { CreateStudyHandler } from './command/create-study.handler';
import { DeleteStudytHandler } from './command/delete-study.handler';
import { UpdateStudyHandler } from './command/update-study.handler';
import { Study } from './entities/study';
import { GetStudyListQueryHandler } from './query/get-study-list.handler';
import { GetStudyInfoQueryHandler } from './query/get-study-info.handler';
import { StudyController } from './study.controller';
import { StudyPlan } from '../studyPlan/entities/studyPlan';

const CommandHandler = [CreateStudyHandler, UpdateStudyHandler, DeleteStudytHandler];

const QueryHandler = [GetStudyListQueryHandler, GetStudyInfoQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([Study, StudyPlan, WordLevel, StudyType]), CqrsModule],
  controllers: [StudyController],

  providers: [...CommandHandler, ...QueryHandler, ConvertException],
})
export class StudyModule {}
