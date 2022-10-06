import { IQuery } from '@nestjs/cqrs';

/**
 * 답변 검색어 조회 시, 사용되는 쿼리 클래스
 */

export class GetCommentSearchQuery implements IQuery {
  constructor(readonly keyword: string) {}
}
