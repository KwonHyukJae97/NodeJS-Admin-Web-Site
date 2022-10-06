import { IQuery } from '@nestjs/cqrs';

/**
 * 답변 전체 조회 시, 사용되는 쿼리 클래스
 */

export class GetCommentInfoQuery implements IQuery {
  constructor(readonly role: string) {}
}
