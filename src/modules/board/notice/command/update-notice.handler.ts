import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNoticeCommand } from './update-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FileUpdateEvent } from '../../../file/event/file-update-event';
import { BoardFileDb } from '../../board-file-db';

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

    @Inject('noticeFile')
    private boardFileDb: BoardFileDb,

    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateNoticeCommand) {
    const { title, content, isTop, noticeGrant, noticeId, fileType, role, accountId, files } =
      command;

    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    if (!notice) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    }

    if (accountId !== notice.boardId.accountId) {
      throw new BadRequestException('작성자만 수정이 가능합니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    notice.isTop = isTop;
    notice.noticeGrant = noticeGrant;
    notice.boardId = board;

    try {
      await this.noticeRepository.save(notice);
    } catch (err) {
      console.log(err);
    }

    // 파일 업데이트 이벤트 처리
    this.eventBus.publish(new FileUpdateEvent(board.boardId, fileType, files, this.boardFileDb));

    // 변경된 공지사항 반환
    return notice;
  }
}
