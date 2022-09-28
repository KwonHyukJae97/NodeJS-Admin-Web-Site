import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Notice } from './entities/notice';
import { NoticeController } from './notice.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNoticeHandler } from './command/create-notice.handler';
import { GetNoticeInfoHandler } from './query/get-notice-info.handler';
import { GetNoticeDetailHandler } from './query/get-notice-detail.handler';
import { UpdateNoticeHandler } from './command/update-notice.handler';
import { DeleteNoticeHandler } from './command/delete-notice.handler';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from '../../../common/utils/multer.options';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, Notice]),
    CqrsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [NoticeController],
  providers: [
    CreateNoticeHandler,
    GetNoticeInfoHandler,
    GetNoticeDetailHandler,
    UpdateNoticeHandler,
    DeleteNoticeHandler,
  ],
})
export class NoticeModule {}
