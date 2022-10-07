import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetNoticeListQuery } from './get-notice-list.query';
import { getDateTime } from '../../../../common/utils/time-common-method';

/**
 * 공지사항 목록 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetNoticeListQuery)
export class GetNoticeListHandler implements IQueryHandler<GetNoticeListQuery> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async execute(query: GetNoticeListQuery) {
    const notice = await this.noticeRepository.find({
      order: { noticeId: 'DESC' },
    });

    if (!notice) {
      throw new NotFoundException('작성된 공지사항이 없습니다.');
    }

    // 시간 변경
    notice.map((notice) => {
      notice.boardId.regDate = getDateTime(notice.boardId.regDate);
    });

    // 공지사항 리스트 반환
    return notice;
  }
}
