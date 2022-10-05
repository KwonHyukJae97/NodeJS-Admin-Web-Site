import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQnaCommand } from './update-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { TestEvent } from '../event/test.event';
import { FileUpdateEvent } from '../event/file-update-event';

/**
 * 1:1 문의 수정 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(UpdateQnaCommand)
export class UpdateQnaHandler implements ICommandHandler<UpdateQnaCommand> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateQnaCommand) {
    const { title, content, qnaId, boardType, files } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    qna.boardId = board;

    try {
      await this.qnaRepository.save(qna);
    } catch (err) {
      console.log(err);
    }

    // 파일 업데이트 이벤트 처리
    this.eventBus.publish(new FileUpdateEvent(board.boardId, boardType, files));
    this.eventBus.publish(new TestEvent());

    // 변경된 문의 내역 반환
    return qna;
  }
}
