import { IQuery } from '@nestjs/cqrs';

/**
 * 답변 전체 리스트 조회용 쿼리
 */
export class GetCommentListQuery implements IQuery {
  constructor(readonly role: string) {}
}
