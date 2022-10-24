import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetNoticeDetailCommand } from './get-notice-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account';

/**
 * 공지사항 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetNoticeDetailCommand)
export class GetNoticeDetailHandler implements ICommandHandler<GetNoticeDetailCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 공지사항 상세 정보 조회 메소드
   * @param command : 공지사항 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 공지사항 상세 정보 반환
   */
  async execute(command: GetNoticeDetailCommand) {
    const { noticeId, role } = command;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    if (!notice) {
      return this.convertException.notFoundError('공지사항', 404);
    }

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (notice.noticeGrant === '0') {
      if (role !== '본사 관리자') {
        throw new BadRequestException('본사 관리자만 접근 가능합니다.');
      }
    } else if (notice.noticeGrant === '0|1') {
      if (role !== '본사 관리자' && role !== '회원사 관리자') {
        throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
      }
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // 공지사항 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    notice.boardId = board;

    try {
      await this.noticeRepository.save(notice);
    } catch (err) {
      return this.convertException.badRequestError('공지사항 정보에', 400);
    }

    const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

    if (!account) {
      return this.convertException.badRequestAccountError('작성자', 400);
    }

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const getNoticeDetailDto = {
      noticeId: noticeId,
      noticeGrant: notice.noticeGrant,
      isTop: notice.isTop,
      boardId: board,
      writer: account.name + '(' + account.nickname + ')',
      fileList: files,
    };

    return getNoticeDetailDto;
  }
}
