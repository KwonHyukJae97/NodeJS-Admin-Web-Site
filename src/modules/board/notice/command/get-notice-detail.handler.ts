import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetNoticeDetailCommand } from './get-notice-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice.entity';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { BoardFile } from '../../../file/entities/board-file.entity';
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
    private dataSource: DataSource,
  ) {}

  /**
   * 공지사항 상세 정보 조회 메소드
   * @param command : 공지사항 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 공지사항 상세 정보 반환
   */
  async execute(command: GetNoticeDetailCommand) {
    const { noticeId } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const notice = await this.noticeRepository.findOneBy({ noticeId });

    if (!notice) {
      return this.convertException.notFoundError('공지사항', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // 공지사항 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      notice.board = board;
      await queryRunner.manager.getRepository(Notice).save(notice);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }

    const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const getNoticeDetailDto = {
      notice,
      writer: account == null ? '탈퇴 회원(*****)' : account.name + '(' + account.nickname + ')',
      fileList: files,
      noticeGrant: notice.noticeGrant,
    };

    return getNoticeDetailDto;
  }
}
