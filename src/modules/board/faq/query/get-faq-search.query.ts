import { IQuery } from '@nestjs/cqrs';

/**
 * FAQ 검색어 조회 시, 사용되는 쿼리 클래스
 */

export class GetFaqSearchQuery implements IQuery {
  constructor(readonly keyword: string) {}
}
