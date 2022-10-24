import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetFaqDetailCommand } from './get-faq-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { FaqCategory } from '../entities/faq_category';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account';

/**
 * FAQ 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetFaqDetailCommand)
export class GetFaqDetailHandler implements ICommandHandler<GetFaqDetailCommand> {
  constructor(
    @InjectRepository(Faq) private faqRepository: Repository<Faq>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(FaqCategory) private categoryRepository: Repository<FaqCategory>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * FAQ 상세 정보 조회 메소드
   * @param command : FAQ 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 FAQ 상세 정보 반환
   */
  async execute(command: GetFaqDetailCommand) {
    const { faqId, role } = command;

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    const category = await this.categoryRepository.findOneBy({
      categoryId: faq.categoryId['categoryId'],
    });

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (!category.isUse && role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    if (!faq) {
      return this.convertException.notFoundError('FAQ', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // FAQ 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    faq.boardId = board;

    try {
      await this.faqRepository.save(faq);
    } catch (err) {
      return this.convertException.badRequestError('FAQ', 400);
    }

    const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

    if (!account) {
      return this.convertException.badRequestAccountError('작성자', 400);
    }

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const getFaqDetailDto = {
      faqId: faqId,
      boardId: board,
      categoryId: faq.categoryId,
      writer: account.name + '(' + account.nickname + ')',
      fileList: files,
    };

    return getFaqDetailDto;
  }
}
