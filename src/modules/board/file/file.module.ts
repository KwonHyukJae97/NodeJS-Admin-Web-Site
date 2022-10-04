import { Module } from '@nestjs/common';
import { FileController } from '../file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileCreateEventsHandler } from '../faq/event/file-create-events.handler';
import { FileUpdateEventsHandler } from '../faq/event/file-update-events.handler';
import { FileDeleteEventsHandler } from '../faq/event/file-delete-events.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile])],
  controllers: [FileController],
  providers: [
    FileService,
    FileCreateEventsHandler,
    FileUpdateEventsHandler,
    FileDeleteEventsHandler,
  ],
})
export class FileModule {}
