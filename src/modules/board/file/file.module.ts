import { Module } from '@nestjs/common';
import { FileController } from '../file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileEventsHandler } from '../notice/event/file-events.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardFile])],
  controllers: [FileController],
  providers: [FileService, FileEventsHandler],
})
export class FileModule {}
