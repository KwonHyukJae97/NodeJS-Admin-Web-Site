import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFaqCommand } from './update-faq.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
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
  ) {}

  /**
   * FAQ 정보 수정 메소드
   * @param command : FAQ 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 FAQ 정보 반환
   */
  async execute(command: UpdateFaqCommand) {
    const { title, content, categoryName, role, accountId, faqId, files } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    const faq = await this.faqRepository.findOneBy({ faqId: faqId });

    if (!faq) {
      return this.convertException.notFoundError('FAQ', 404);
    }

    // TODO : 유저 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (accountId != faq.boardId.accountId) {
      throw new BadRequestException('작성자만 수정이 가능합니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: faq.boardId.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    const category = await this.categoryRepository.findOneBy({ categoryName: categoryName });

    if (!category) {
      return this.convertException.notFoundError('카테고리', 404);
    }

    faq.boardId = board;
    faq.categoryId = category.categoryId;

    try {
      await this.faqRepository.save(faq);
    } catch (err) {
      return this.convertException.badRequestError('FAQ 정보에', 400);
    }

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

    return faq;
  }
}
