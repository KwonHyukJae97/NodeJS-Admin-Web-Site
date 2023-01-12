import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice.entity';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { GetNoticeListQuery } from './get-notice-list.query';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Page } from '../../../../common/utils/page';

/**
 * 공지사항 전체 & 검색어에 해당하는 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetNoticeListQuery)
export class GetNoticeListHandler implements IQueryHandler<GetNoticeListQuery> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 공지사항 전체 리스트 조회 및 검색어 조회 메소드
   * @param query : 공지사항 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            검색어가 없을 경우, 조회 성공 시 공지사항 전체 리스트 반환 /
   *            검색어가 있을 경우, 조회 성공 시 검색어에 포함되는 공지사항 리스트 반환
   */
  async execute(query: GetNoticeListQuery) {
    const { param } = query;

    const notice = await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.board', 'board')
      .where('notice.noticeGrant = :noticeGrant', { noticeGrant: param.noticeGrant })
      .orderBy('notice.isTop', 'DESC')
      .addOrderBy('notice.noticeId', 'DESC');

    // 검색 키워드가 있을 경우
    if (param.searchWord) {
      notice.andWhere('board.title like :title', { title: `%${param.searchWord}%` });
    }

    let tempQuery = notice;

    // 전체 조회 값이 false일 경우, 페이징 처리
    if (!param.totalData) {
      tempQuery = tempQuery.take(param.getLimit()).skip(param.getOffset());
    }

    // 최종 데이터 반환
    const list = await tempQuery.getMany();
    // 최종 데이터의 총 개수 반환
    const total = await tempQuery.getCount();
    // 전체 조회 값 여부에 따른 pageNo/pageSize 반환값 설정
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('공지사항', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
