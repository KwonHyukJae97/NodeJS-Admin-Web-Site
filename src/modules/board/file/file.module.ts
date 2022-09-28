import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileController } from '../file.controller';
import { FileService } from './file.service';
import { multerOptionsFactory } from '../../../common/utils/multer.options';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { BoardFile } from './entities/board_file';
import { FileEventsHandler } from '../notice/event/file-events.handler';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Board, BoardFile]),
  ],
  controllers: [FileController],
  providers: [FileService, FileEventsHandler],
})
export class FileModule {}
