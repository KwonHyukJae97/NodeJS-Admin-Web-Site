import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNoticeCommand } from './update-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { FilesUpdateEvent } from '../../../file/event/files-update-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { FilesDeleteEvent } from '../../../file/event/files-delete-event';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * 공지사항 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateNoticeCommand)
export class UpdateNoticeHandler implements ICommandHandler<UpdateNoticeCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject('noticeFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
  ) {}

  /**
   * 공지사항 정보 수정 메소드
   * @param command : 공지사항 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 공지사항 정보 반환
   */
  async execute(command: UpdateNoticeCommand) {
    const { title, content, isTop, noticeGrant, noticeId, role, files } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const notice = await this.noticeRepository.findOneBy({ noticeId });

    if (!notice) {
      return this.convertException.notFoundError('공지사항', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // if (account.accountId != board.accountId) {
    //   return this.convertException.badRequestAccountError('작성자', 400);
    // }

    board.title = title;
    board.content = content;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    notice.isTop = isTop;
    notice.noticeGrant = noticeGrant;
    notice.board = board;

    try {
      await this.noticeRepository.save(notice);
    } catch (err) {
      return this.convertException.badRequestError('공지사항 정보에', 400);
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
          new FilesCreateEvent(board.boardId, FileType.NOTICE, files, this.boardFileDb),
        );
        // 신규 파일 & 기존 파일 모두 존재하면 '수정' 이벤트 처리
      } else {
        this.eventBus.publish(
          new FilesUpdateEvent(board.boardId, FileType.NOTICE, files, this.boardFileDb),
        );
      }
    }

    return notice;
  }
}
