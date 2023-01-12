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
import { Percent } from '../percent/entities/percent';
import { LevelStandard } from '../levelStandard/entities/levelStandard';
import { GradeLevelRank } from '../gradeLevelRank/entities/gradeLevelRank';
import { StudyUnit } from '../studyUnit/entities/studyUnit';
import { StudyFileDb } from './study-file-db';
import { StudyFile } from '../file/entities/study-file';
// import { CreateFilesHandler } from '../file/command/create-file.handler';
import { FileService } from '../file/file.service';

const CommandHandler = [
  CreateStudyHandler,
  UpdateStudyHandler,
  DeleteStudytHandler,
  // CreateFilesHandler,
  FileService,
];

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
    ]),
    CqrsModule,
  ],
  controllers: [StudyController],

  providers: [
    ...CommandHandler,
    ...QueryHandler,
    ConvertException,
    { provide: 'studyFile', useClass: StudyFileDb },
  ],
})
export class StudyModule {}
