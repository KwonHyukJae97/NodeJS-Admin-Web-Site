import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateFaqCommand } from './create-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FaqCategory } from '../entities/faq_category';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * FAQ 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateFaqCommand)
export class CreateFaqHandler implements ICommandHandler<CreateFaqCommand> {
  constructor(
    @InjectRepository(Faq) private faqRepository: Repository<Faq>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(FaqCategory) private categoryRepository: Repository<FaqCategory>,
    @Inject('faqFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
    private dataSource: DataSource,
  ) {}

  /**
   * FAQ 등록 메소드
   * @param command : FAQ 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 FAQ 정보 반환
   */
  async execute(command: CreateFaqCommand) {
    const { title, content, categoryName, files, account } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board = queryRunner.manager.getRepository(Board).create({
        accountId: account.accountId,
        boardTypeCode: '1',
        title,
        content,
        viewCount: 0,
      });

      await queryRunner.manager.getRepository(Board).save(board);

      const category = await this.categoryRepository.findOneBy({ categoryName: categoryName });

      if (!category) {
        return this.convertException.notFoundError('카테고리', 404);
      }

      const faq = this.faqRepository.create({
        boardId: board.boardId,
        categoryId: category.categoryId,
        board: board,
      });

      await queryRunner.manager.getRepository(Faq).save(faq);

      if (files.length !== 0) {
        // 파일 업로드 이벤트 처리
        this.eventBus.publish(
          new FilesCreateEvent(board.boardId, FileType.FAQ, files, this.boardFileDb),
        );
      }

      await queryRunner.commitTransaction();
      return faq;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('FAQ 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
