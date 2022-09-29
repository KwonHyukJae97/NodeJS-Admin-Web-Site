import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNoticeCommand } from './delete-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '../entities/notice';
import { Board } from '../../entities/board';
import { TestEvent } from '../event/test.event';
import { FileDeleteEvent } from '../event/file-delete-event';
import { BoardFile } from '../../file/entities/board_file';

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

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,

    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteNoticeCommand) {
    const { noticeId } = command;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    // board_file db 삭제
    files.map((file) => {
      this.fileRepository.delete({ boardFileId: file.boardFileId });
    });

    // 파일 삭제 이벤트 처리
    this.eventBus.publish(new FileDeleteEvent(board.boardId));
    this.eventBus.publish(new TestEvent());

    // notice db 삭제
    await this.noticeRepository.delete(notice);

    // board db 삭제 (fk)
    await this.boardRepository.delete({ boardId: board.boardId });

    return '공지사항 삭제 성공';
  }
}
