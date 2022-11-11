import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateFaqCommand } from './create-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
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
  ) {}

  /**
   * FAQ 등록 메소드
   * @param command : FAQ 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 FAQ 정보 반환
   */
  async execute(command: CreateFaqCommand) {
    const { title, content, categoryName, role, files } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    const board = this.boardRepository.create({
      accountId: 27,
      fileTypeCode: '1',
      title,
      content,
      viewCount: 0,
    });

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    const category = await this.categoryRepository.findOneBy({ categoryName: categoryName });

    if (!category) {
      return this.convertException.notFoundError('카테고리', 404);
    }

    const faq = this.faqRepository.create({
      boardId: board.boardId,
      categoryId: category.categoryId,
      board: board,
    });

    try {
      await this.faqRepository.save(faq);
    } catch (err) {
      return this.convertException.badRequestError('FAQ 정보에', 400);
    }

    if (files.length !== 0) {
      // 파일 업로드 이벤트 처리
      this.eventBus.publish(
        new FilesCreateEvent(board.boardId, FileType.FAQ, files, this.boardFileDb),
      );
    }

    return faq;
  }
}
