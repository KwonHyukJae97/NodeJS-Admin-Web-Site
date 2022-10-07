import { IQuery } from '@nestjs/cqrs';

/**
 * 공지사항 검색어 조회 시, 사용되는 쿼리 클래스
 */

export class GetNoticeSearchQuery implements IQuery {
  constructor(readonly keyword: string, readonly role: string, readonly noticeGrant: string) {}
}
