import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNoticeCommand } from './delete-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '../entities/notice';
import { Board } from '../../entities/board';

/**
 * 공지사항 삭제 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(DeleteNoticeCommand)
export class DeleteNoticeHandler implements ICommandHandler<DeleteNoticeCommand> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(command: DeleteNoticeCommand) {
    const { noticeId } = command;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });

    await this.boardRepository.delete(board);

    await this.noticeRepository.delete(notice);

    return '공지사항 삭제 성공';
  }
}
