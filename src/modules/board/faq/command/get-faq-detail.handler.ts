import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetFaqDetailCommand } from './get-faq-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';
import { FaqCategory } from '../entities/faq_category';
import { getDateTime } from '../../../../common/utils/time-common-method';

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

    @InjectRepository(FaqCategory)
    private categoryRepository: Repository<FaqCategory>,
  ) {}

  async execute(command: GetFaqDetailCommand) {
    const { faqId, role } = command;

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    const category = await this.categoryRepository.findOneBy({
      categoryId: faq.categoryId['categoryId'],
    });

    if (!category.isUse && role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    if (!faq) {
      throw new NotFoundException('존재하지 않는 FAQ입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });
    // FAQ 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    faq.boardId = board;

    try {
      await this.faqRepository.save(faq);
    } catch (err) {
      console.log(err);
    }

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    // 시간 변경
    faq.boardId.regDate = getDateTime(faq.boardId.regDate);

    const getFaqDetailDto = {
      faqId: faqId,
      boardId: board,
      categoryId: faq.categoryId,
      fileList: files,
    };

    return getFaqDetailDto;
  }
}
