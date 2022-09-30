import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetNoticeSearchQuery } from './get-notice-search.query';

/**
 * 공지사항 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetNoticeSearchQuery)
export class GetNoticeSearchHandler implements IQueryHandler<GetNoticeSearchQuery> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async execute(query: GetNoticeSearchQuery) {
    const { keyword } = query;

    const notice = await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.boardId', 'board')
      .where('notice.board = :title', { title: Like(`%${keyword}%`) })
      .getMany();

    if (!notice) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    // 공지사항 리스트 반환
    return notice;
  }
}
