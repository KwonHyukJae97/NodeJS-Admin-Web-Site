import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { StudyType } from '../studyType/entities/studyType.entity';
import { WordLevel } from '../wordLevel/entities/wordLevel.entity';
import { CreateStudyHandler } from './command/create-study.handler';
import { DeleteStudytHandler } from './command/delete-study.handler';
import { UpdateStudyHandler } from './command/update-study.handler';
import { Study } from './entities/study.entity';
import { GetStudyListQueryHandler } from './query/get-study-list.handler';
import { GetStudyInfoQueryHandler } from './query/get-study-info.handler';
import { StudyController } from './study.controller';
import { StudyPlan } from '../studyPlan/entities/studyPlan.entity';
import { Percent } from '../percent/entities/percent.entity';
import { LevelStandard } from '../levelStandard/entities/levelStandard.entity';
import { GradeLevelRank } from '../gradeLevelRank/entities/gradeLevelRank.entity';
import { StudyUnit } from '../studyUnit/entities/studyUnit.entity';
import { StudyFileDb } from './study-file-db';
import { StudyFile } from '../file/entities/study-file.entity';
import { FileService } from '../file/file.service';
import { StudyPlanFile } from '../file/entities/studyPlan-file.entity';
import { StudyPlanFileDb } from '../studyPlan/studyPlan-file-db';

const CommandHandler = [CreateStudyHandler, UpdateStudyHandler, DeleteStudytHandler, FileService];

const QueryHandler = [GetStudyListQueryHandler, GetStudyInfoQueryHandler];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Study,
      Percent,
      LevelStandard,
      GradeLevelRank,
      StudyPlan,
      StudyUnit,
      WordLevel,
      StudyType,
      StudyFile,
      StudyPlanFile,
    ]),
    CqrsModule,
  ],
  controllers: [StudyController],

  providers: [
    ...CommandHandler,
    ...QueryHandler,
    ConvertException,
    { provide: 'studyFile', useClass: StudyFileDb },
    { provide: 'studyPlanFile', useClass: StudyPlanFileDb },
  ],
})
export class StudyModule {}
