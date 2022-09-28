import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './create-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FileCreateEvent } from '../event/file-create-event';
import { TestEvent } from '../event/test.event';

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
    const { title, content, isTop, noticeGrant, files } = command;

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

    // 파일 업로드 이벤트 처리
    this.eventBus.publish(new FileCreateEvent(board.boardId, files));
    this.eventBus.publish(new TestEvent());

    return '공지사항 등록 성공';
  }
}
