import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "../entities/board";
import { Notice } from "./entities/notice";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";

@Module({
  imports: [TypeOrmModule.forFeature([Board, Notice])],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
