import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './create-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 공지사항 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateNoticeCommand)
export class CreateNoticeHandler implements ICommandHandler<CreateNoticeCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject('noticeFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
  ) {}

  /**
   * 공지사항 등록 메소드
   * @param command : 공지사항 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 공지사항 정보 반환
   */
  async execute(command: CreateNoticeCommand) {
    const { title, content, isTop, noticeGrant, role, files } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const board = this.boardRepository.create({
      accountId: 27,
      fileTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    const notice = this.noticeRepository.create({
      noticeGrant,
      isTop,
      boardId: board.boardId,
      board: board,
    });

    try {
      await this.noticeRepository.save(notice);
    } catch (err) {
      return this.convertException.badRequestError('공지사항 정보에', 400);
    }

    if (files.length !== 0) {
      // 파일 업로드 이벤트 처리
      this.eventBus.publish(
        new FilesCreateEvent(board.boardId, FileType.NOTICE, files, this.boardFileDb),
      );
    }

    return notice;
  }
}
