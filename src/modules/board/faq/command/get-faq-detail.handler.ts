import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetFaqDetailCommand } from './get-faq-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';

/**
 * FAQ 상세조회 시, 커맨드를 처리하는 커맨드 핸들러 (서비스 로직 수행)
 */

@Injectable()
@CommandHandler(GetFaqDetailCommand)
export class GetFaqDetailHandler implements ICommandHandler<GetFaqDetailCommand> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  async execute(command: GetFaqDetailCommand) {
    const { faqId } = command;

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    if (!faq) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });
    // FAQ 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    await this.boardRepository.save(board);

    faq.boardId = board;

    await this.faqRepository.save(faq);

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const getFaqDetailDto = {
      faqId: faqId,
      boardId: board,
      fileList: files,
    };

    return getFaqDetailDto;
  }
}
