import { IQuery } from '@nestjs/cqrs';

/**
 * 1:1 문의 검색어 조회 시, 사용되는 쿼리 클래스
 */

export class GetQnaSearchQuery implements IQuery {
  constructor(readonly keyword: string) {}
}
