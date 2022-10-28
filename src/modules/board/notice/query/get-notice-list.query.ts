import { IQuery } from '@nestjs/cqrs';

/**
 * 공지사항 전체 & 검색어에 해당하는 리스트 조회용 쿼리
 */
export class GetNoticeListQuery implements IQuery {
  constructor(readonly keyword: string, readonly role: string, readonly noticeGrant: string) {}
}
