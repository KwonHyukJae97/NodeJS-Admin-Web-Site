import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board';
import { BoardFile } from './entities/board_file';
import { CqrsModule } from '@nestjs/cqrs';
import { FileEventsHandler } from './event/file-events.handler';
import { GetAllFilesDownloadHandler } from './query/get-files-download.handler';
import { GetFileDownloadHandler } from './query/get-file-download.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile]), CqrsModule],
  controllers: [FileController],
  providers: [FileService, FileEventsHandler, GetAllFilesDownloadHandler, GetFileDownloadHandler],
})
export class FileModule {}
