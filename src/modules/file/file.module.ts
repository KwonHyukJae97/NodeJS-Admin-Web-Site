import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board.entity';
import { BoardFile } from './entities/board-file.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllFilesDownloadHandler } from './query/get-files-download.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';
import { BoardFileDb } from '../board/board-file-db';
import { AccountFileDb } from '../account/account-file-db';
import { AccountFile } from './entities/account-file.entity';
import { Account } from '../account/entities/account.entity';
import { ConvertException } from '../../common/utils/convert-exception';
import { StudyFileDb } from '../study/study-file-db';
import { StudyPlanFileDb } from '../studyPlan/studyPlan-file-db';
import { Study } from '../study/entities/study.entity';
import { StudyFile } from './entities/study-file.entity';
import { StudyPlan } from '../studyPlan/entities/studyPlan.entity';
import { StudyPlanFile } from './entities/studyPlan-file.entity';

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
    ...QueryHandlers,
    ConvertException,
    { provide: 'boardFile', useClass: BoardFileDb },
    { provide: 'accountFile', useClass: AccountFileDb },
    { provide: 'studyFile', useClass: StudyFileDb },
    { provide: 'studyPlanFile', useClass: StudyPlanFileDb },
  ],
})
export class FileModule {}
