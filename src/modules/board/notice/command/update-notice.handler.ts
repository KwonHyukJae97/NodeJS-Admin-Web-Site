import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateNoticeCommand } from "./update-notice.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Notice } from "../entities/notice";
import { Repository } from "typeorm";
import { Board } from "../../entities/board";

/**
 * 공지사항 수정 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(UpdateNoticeCommand)
export class UpdateNoticeHandler implements ICommandHandler<UpdateNoticeCommand> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(command: UpdateNoticeCommand) {
    const { title, content, isTop, noticeGrant, noticeId } = command;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });

    if (!board) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    }

    board.title = title;
    board.content = content;

    await this.boardRepository.save(board);

    if (!notice) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    }

    notice.isTop = isTop;
    notice.noticeGrant = noticeGrant;
    notice.boardId = board;

    await this.noticeRepository.save(notice);
    // 변경된 공지사항 반환
    return notice;
  }
}
