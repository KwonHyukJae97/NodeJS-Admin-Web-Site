import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFaqCommand } from './update-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FaqCategory } from '../entities/faq_category';
import { FilesUpdateEvent } from '../../../file/event/files-update-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { FilesDeleteEvent } from '../../../file/event/files-delete-event';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * FAQ 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateFaqCommand)
export class UpdateFaqHandler implements ICommandHandler<UpdateFaqCommand> {
  constructor(
    @InjectRepository(Faq) private faqRepository: Repository<Faq>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(FaqCategory) private categoryRepository: Repository<FaqCategory>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject('faqFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
    private dataSource: DataSource,
  ) {}

  /**
   * FAQ 정보 수정 메소드
   * @param command : FAQ 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 FAQ 정보 반환
   */
  async execute(command: UpdateFaqCommand) {
    const { title, content, categoryName, faqId, files } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const faq = await this.faqRepository.findOneBy({ faqId });

    if (!faq) {
      return this.convertException.notFoundError('FAQ', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // if (account.accountId != board.accountId) {
    //   return this.convertException.badRequestAccountError('작성자', 400);
    // }

    board.title = title;
    board.content = content;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      const category = await this.categoryRepository.findOneBy({ categoryName });

      if (!category) {
        return this.convertException.notFoundError('카테고리', 404);
      }

      faq.board = board;
      faq.categoryId = category.categoryId;
      await queryRunner.manager.getRepository(Faq).save(faq);

      const boardFiles = await this.fileRepository.findBy({ boardId: board.boardId });

      if (files.length === 0) {
        // 기존 파일만 존재하면 '삭제' 이벤트 처리
        if (boardFiles.length !== 0) {
          this.eventBus.publish(new FilesDeleteEvent(board.boardId, this.boardFileDb));
        }
      } else {
        // 신규 파일만 존재하면 '등록' 이벤트 처리
        if (boardFiles.length === 0) {
          this.eventBus.publish(
            new FilesCreateEvent(board.boardId, FileType.FAQ, files, this.boardFileDb),
          );
          // 신규 파일 & 기존 파일 모두 존재하면 '수정' 이벤트 처리
        } else {
          this.eventBus.publish(
            new FilesUpdateEvent(board.boardId, FileType.FAQ, files, this.boardFileDb),
          );
        }
      }
      await queryRunner.commitTransaction();
      return faq;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('FAQ 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
