import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQnaCommand } from './delete-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Qna } from '../entities/qna';
import { Board } from '../../entities/board';
import { TestEvent } from '../event/test.event';
import { FileDeleteEvent } from '../event/file-delete-event';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 1:1 문의 삭제 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(DeleteQnaCommand)
export class DeleteQnaHandler implements ICommandHandler<DeleteQnaCommand> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,

    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteQnaCommand) {
    const { qnaId } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    // board_file db 삭제
    files.map((file) => {
      this.fileRepository.delete({ boardFileId: file.boardFileId });
    });

    // 파일 삭제 이벤트 처리
    this.eventBus.publish(new FileDeleteEvent(board.boardId));
    this.eventBus.publish(new TestEvent());

    // qna db 삭제
    try {
      await this.qnaRepository.delete(qna);
    } catch (err) {
      console.log(err);
    }

    // board db 삭제 (fk)
    try {
      await this.boardRepository.delete({ boardId: board.boardId });
    } catch (err) {
      console.log(err);
    }

    return '1:1 문의 삭제 성공';
  }
}
