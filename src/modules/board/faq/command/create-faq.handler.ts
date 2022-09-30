import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateFaqCommand } from './create-Faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FileCreateEvent } from '../event/file-create-event';
import { TestEvent } from '../event/test.event';

/**
 * FAQ 등록 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(CreateFaqCommand)
export class CreateFaqHandler implements ICommandHandler<CreateFaqCommand> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    private eventBus: EventBus,
  ) {}

  async execute(command: CreateFaqCommand) {
    const { title, content, files } = command;

    const board = this.boardRepository.create({
      // 임시 accountId 부여
      accountId: 1,
      boardTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    await this.boardRepository.save(board);

    const faq = this.faqRepository.create({
      boardId: board,
    });

    await this.faqRepository.save(faq);

    // 파일 업로드 이벤트 처리
    this.eventBus.publish(new FileCreateEvent(board.boardId, files));
    this.eventBus.publish(new TestEvent());

    return 'FAQ 등록 성공';
  }
}
