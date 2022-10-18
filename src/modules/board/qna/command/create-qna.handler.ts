import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateQnaCommand } from './create-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * 1:1 문의 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateQnaCommand)
export class CreateQnaHandler implements ICommandHandler<CreateQnaCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject('qnaFile') private boardFileDb: BoardFileDb,
    private eventBus: EventBus,
  ) {}

  /**
   * 1:1 문의 등록 메소드
   * @param command : 1:1 문의 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 1:1 문의 정보 반환
   */
  async execute(command: CreateQnaCommand) {
    const { title, content, files } = command;

    const board = this.boardRepository.create({
      // 임시 accountId 부여
      accountId: 3,
      fileTypeCode: '2',
      title,
      content,
      viewCount: 0,
    });

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    const qna = this.qnaRepository.create({
      boardId: board,
    });

    try {
      await this.qnaRepository.save(qna);
    } catch (err) {
      console.log(err);
    }

    // 파일 업로드 이벤트 처리
    this.eventBus.publish(
      new FilesCreateEvent(board.boardId, FileType.QNA, files, this.boardFileDb),
    );

    return qna;
  }
}
