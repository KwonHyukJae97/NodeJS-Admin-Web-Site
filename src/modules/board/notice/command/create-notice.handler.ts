import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from "./create-notice.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Notice } from "../entities/notice";
import { Repository } from "typeorm";
import { Board } from "../../entities/board";

/**
 * 공지사항 등록 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(CreateNoticeCommand)
export class CreateNoticeHandler implements ICommandHandler<CreateNoticeCommand> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(command: CreateNoticeCommand) {
    const { title, content, isTop, noticeGrant } = command;

    const board = this.boardRepository.create({
      // 임시 accountId 부여
      accountId: 1,
      boardTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    await this.boardRepository.save(board);

    const notice = this.noticeRepository.create({
      noticeGrant,
      isTop,
      boardId: board,
    });

    await this.noticeRepository.save(notice);

    return '공지사항 등록 성공';
  }
}
