import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFaqCommand } from './update-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { TestEvent } from '../event/test.event';
import { FileUpdateEvent } from '../event/file-update-event';

/**
 * FAQ 수정 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(UpdateFaqCommand)
export class UpdateFaqHandler implements ICommandHandler<UpdateFaqCommand> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateFaqCommand) {
    const { title, content, faqId, files } = command;

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });

    if (!board) {
      throw new NotFoundException('존재하지 않는 FAQ입니다.');
    }

    board.title = title;
    board.content = content;

    await this.boardRepository.save(board);

    if (!faq) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    faq.boardId = board;

    await this.faqRepository.save(faq);

    // 파일 업데이트 이벤트 처리
    this.eventBus.publish(new FileUpdateEvent(board.boardId, files));
    this.eventBus.publish(new TestEvent());

    // 변경된 FAQ 반환
    return faq;
  }
}
