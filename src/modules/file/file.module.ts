import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board';
import { BoardFile } from './entities/board-file';
import { CqrsModule } from '@nestjs/cqrs';
import { FileEventsHandler } from './event/file-events.handler';
import { GetAllFilesDownloadHandler } from './query/get-files-download.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { BoardFileDb } from '../board/board-file-db';
import { AccountFileDb } from '../account/account-file-db';
import { AccountFile } from './entities/account-file';
import { Account } from '../account/entities/account';
import { ConvertException } from '../../common/utils/convert-exception';
import { StudyFileDb } from '../study/study-file-db';
import { StudyPlanFileDb } from '../studyPlan/studyPlan-file-db';
import { Study } from '../study/entities/study';
import { StudyFile } from './entities/study-file';
import { StudyPlan } from '../studyPlan/entities/studyPlan';
import { StudyPlanFile } from './entities/studyPlan-file';

const QueryHandlers = [GetAllFilesDownloadHandler, GetFileDownloadHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      BoardFile,
      Account,
      AccountFile,
      Study,
      StudyFile,
      StudyPlan,
      StudyPlanFile,
    ]),
    CqrsModule,
  ],
  controllers: [FileController],
  providers: [
    FileService,
    FileEventsHandler,
    ...QueryHandlers,
    ConvertException,
    { provide: 'boardFile', useClass: BoardFileDb },
    { provide: 'accountFile', useClass: AccountFileDb },
    { provide: 'studyFile', useClass: StudyFileDb },
    { provide: 'studyPlanFile', useClass: StudyPlanFileDb },
  ],
})
export class FileModule {}
