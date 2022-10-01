import { Module } from '@nestjs/common';
import { FileController } from '../file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileCreateEventsHandler } from '../notice/event/file-create-events.handler';
import { FileUpdateEventsHandler } from '../notice/event/file-update-events.handler';
import { FileDeleteEventsHandler } from '../notice/event/file-delete-events.handler';

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
