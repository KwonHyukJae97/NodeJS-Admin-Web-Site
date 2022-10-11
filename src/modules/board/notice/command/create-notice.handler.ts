import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './create-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FileCreateEvent } from '../../file/event/file-create-event';

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

    private eventBus: EventBus,
  ) {}

  async execute(command: CreateNoticeCommand) {
    const { title, content, isTop, noticeGrant, boardType, role, files } = command;

    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const board = this.boardRepository.create({
      // 임시 accountId 부여
      accountId: 2,
      boardTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    const notice = this.noticeRepository.create({
      noticeGrant,
      isTop,
      boardId: board,
    });

    try {
      await this.noticeRepository.save(notice);
    } catch (err) {
      console.log(err);
    }

    // 파일 업로드 이벤트 처리
    this.eventBus.publish(new FileCreateEvent(board.boardId, boardType, files));

    return '공지사항 등록 성공';
  }
}
