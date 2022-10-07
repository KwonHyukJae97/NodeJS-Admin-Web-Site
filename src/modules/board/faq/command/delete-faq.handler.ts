import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFaqCommand } from './delete-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../entities/faq';
import { Board } from '../../entities/board';
import { TestEvent } from '../event/test-event';
import { FileDeleteEvent } from '../event/file-delete-event';
import { BoardFile } from '../../file/entities/board_file';

/**
 * FAQ 삭제 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(DeleteFaqCommand)
export class DeleteFaqHandler implements ICommandHandler<DeleteFaqCommand> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,

    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteFaqCommand) {
    const { faqId, role } = command;

    if (role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    if (!faq) {
      throw new NotFoundException('존재하지 않는 FAQ입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    // 파일 삭제 이벤트 처리
    this.eventBus.publish(new FileDeleteEvent(board.boardId, files));
    this.eventBus.publish(new TestEvent());

    // board_file db 삭제
    files.map((file) => {
      this.fileRepository.delete({ boardFileId: file.boardFileId });
    });

    // faq db 삭제
    try {
      await this.faqRepository.delete(faq);
    } catch (err) {
      console.log(err);
    }

    // board db 삭제 (fk)
    try {
      await this.boardRepository.delete({ boardId: board.boardId });
    } catch (err) {
      console.log(err);
    }

    return 'FAQ 삭제 성공';
  }
}
