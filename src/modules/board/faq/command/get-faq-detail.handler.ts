import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetFaqDetailCommand } from './get-faq-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq.entity';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { BoardFile } from '../../../file/entities/board-file.entity';
import { FaqCategory } from '../entities/faq_category.entity';
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
    private dataSource: DataSource,
  ) {}

  /**
   * FAQ 상세 정보 조회 메소드
   * @param command : FAQ 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 FAQ 상세 정보 반환
   */
  async execute(command: GetFaqDetailCommand) {
    const { faqId } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const faq = await this.faqRepository.findOneBy({ faqId });

    const category = await this.categoryRepository.findOneBy({
      categoryId: faq.categoryId,
    });

    if (!faq) {
      return this.convertException.notFoundError('FAQ', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // FAQ 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      faq.board = board;
      await queryRunner.manager.getRepository(Faq).save(faq);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }

    const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const getFaqDetailDto = {
      faq,
      writer: account == null ? '탈퇴 회원(*****)' : account.name + '(' + account.nickname + ')',
      fileList: files,
      category: category,
    };

    return getFaqDetailDto;
  }
}
