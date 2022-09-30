import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNoticeInfoQuery } from './get-notice-info.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * 공지사항 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetNoticeInfoQuery)
export class GetNoticeInfoHandler implements IQueryHandler<GetNoticeInfoQuery> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async execute(query: GetNoticeInfoQuery) {
    const notice = await this.noticeRepository.find({
      order: { noticeId: 'DESC' },
    });

    if (!notice) {
      throw new NotFoundException('작성된 공지사항이 없습니다.');
    }
    // 공지사항 리스트 반환
    return notice;
  }
}
