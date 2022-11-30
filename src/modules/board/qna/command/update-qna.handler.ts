import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQnaCommand } from './update-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FilesUpdateEvent } from '../../../file/event/files-update-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { FilesDeleteEvent } from '../../../file/event/files-delete-event';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * 1:1 문의 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateQnaCommand)
export class UpdateQnaHandler implements ICommandHandler<UpdateQnaCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject('qnaFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
  ) {}

  /**
   * 1:1 문의 정보 수정 메소드
   * @param command : 1:1 문의 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 1:1 문의 정보 반환
   */
  async execute(command: UpdateQnaCommand) {
    const { title, content, qnaId, files } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId });

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // if (account.accountId != board.accountId) {
    //   return this.convertException.badRequestAccountError('작성자', 400);
    // }

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    qna.board = board;

    try {
      await this.qnaRepository.save(qna);
    } catch (err) {
      return this.convertException.badRequestError('QnA 정보에', 400);
    }

    const boardFiles = await this.fileRepository.findBy({ boardId: board.boardId });

    if (files.length === 0) {
      // 기존 파일만 존재하면 '삭제' 이벤트 처리
      if (boardFiles.length !== 0) {
        this.eventBus.publish(new FilesDeleteEvent(board.boardId, this.boardFileDb));
      }
    } else {
      // 신규 파일만 존재하면 '등록' 이벤트 처리
      if (boardFiles.length === 0) {
        this.eventBus.publish(
          new FilesCreateEvent(board.boardId, FileType.QNA, files, this.boardFileDb),
        );
        // 신규 파일 & 기존 파일 모두 존재하면 '수정' 이벤트 처리
      } else {
        this.eventBus.publish(
          new FilesUpdateEvent(board.boardId, FileType.QNA, files, this.boardFileDb),
        );
      }
    }

    return qna;
  }
}
