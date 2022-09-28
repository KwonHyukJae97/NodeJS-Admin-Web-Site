import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNoticeDetailQuery } from './get-notice-detail.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '../entities/notice';
import { NotFoundException } from '@nestjs/common';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';
import { GetNoticeDetailDto } from '../dto/get-notice-detail.dto';

/**
 * 공지사항 상세 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetNoticeDetailQuery)
export class GetNoticeDetailHandler implements IQueryHandler<GetNoticeDetailQuery> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  async execute(query: GetNoticeDetailQuery): Promise<GetNoticeDetailDto> {
    const { noticeId } = query;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    if (!notice) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });
    // 공지사항 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    await this.boardRepository.save(board);

    notice.boardId = board;

    await this.noticeRepository.save(notice);

    const files = await this.fileRepository.findBy({ boardId: board.boardId });
    // console.log({ fileList: files });

    const getNoticeDetailDto = {
      noticeId: noticeId,
      noticeGrant: notice.noticeGrant,
      isTop: notice.isTop,
      boardId: board,
      fileList: files,
    };

    return getNoticeDetailDto;
  }
}
