import { IQuery } from '@nestjs/cqrs';

/**
 * FAQ 카테고리별 검색어 조회 시, 사용되는 쿼리 클래스
 */

export class GetFaqSearchQuery implements IQuery {
  constructor(readonly categoryName: string, readonly keyword: string, readonly role: string) {}
}
