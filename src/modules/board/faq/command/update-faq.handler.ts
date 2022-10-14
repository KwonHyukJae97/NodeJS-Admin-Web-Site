import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFaqCommand } from './update-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FaqCategory } from '../entities/faq_category';
import { FileUpdateEvent } from '../../../file/event/file-update-event';
import { BoardFileDb } from '../../board-file-db';

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

    @InjectRepository(FaqCategory)
    private categoryRepository: Repository<FaqCategory>,

    @Inject('faqFile')
    private boardFileDb: BoardFileDb,

    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateFaqCommand) {
    const { title, content, categoryName, fileType, role, accountId, faqId, files } = command;

    if (role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    if (!faq) {
      throw new NotFoundException('존재하지 않는 FAQ입니다.');
    }

    if (accountId != faq.boardId.accountId) {
      throw new BadRequestException('작성자만 수정이 가능합니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    const category = await this.categoryRepository.findOneBy({ categoryName: categoryName });

    faq.boardId = board;
    faq.categoryId = category.categoryId;

    try {
      await this.faqRepository.save(faq);
    } catch (err) {
      console.log(err);
    }

    // 파일 업데이트 이벤트 처리
    this.eventBus.publish(new FileUpdateEvent(board.boardId, fileType, files, this.boardFileDb));

    // 변경된 FAQ 반환
    return faq;
  }
}
