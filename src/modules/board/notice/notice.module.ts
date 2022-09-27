import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "../entities/board";
import { Notice } from "./entities/notice";
import { NoticeController } from "./notice.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateNoticeHandler } from "./command/create-notice.handler";
import { GetNoticeInfoHandler } from "./query/get-notice-info.handler";
import { GetNoticeDetailHandler } from "./query/get-notice-detail.handler";
import { UpdateNoticeHandler } from "./command/update-notice.handler";
import { DeleteNoticeHandler } from "./command/delete-notice.handler";

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice]), CqrsModule],
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
