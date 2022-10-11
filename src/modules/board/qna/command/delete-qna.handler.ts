import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQnaCommand } from './delete-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Qna } from '../entities/qna';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';
import { Comment } from '../../comment/entities/comment';
import { FileDeleteEvent } from '../../file/event/file-delete-event';

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

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteQnaCommand) {
    const { qnaId, accountId } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    if (accountId != qna.boardId.accountId) {
      throw new BadRequestException('작성자만 삭제가 가능합니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    // 파일 삭제 이벤트 처리
    this.eventBus.publish(new FileDeleteEvent(board.boardId, files));

    // board_file db 삭제
    files.map((file) => {
      this.fileRepository.softDelete({ boardFileId: file.boardFileId });
    });

    const comments = await this.commentRepository.findBy({ qnaId: qnaId });

    comments.map((comment) => {
      this.commentRepository.softDelete({ commentId: comment.commentId });
    });

    // qna db 삭제
    try {
      await this.qnaRepository.delete(qna);
    } catch (err) {
      console.log(err);
    }

    // board db 삭제 (fk)
    try {
      await this.boardRepository.softDelete({ boardId: board.boardId });
    } catch (err) {
      console.log(err);
    }

    return '1:1 문의 삭제 성공';
  }
}
