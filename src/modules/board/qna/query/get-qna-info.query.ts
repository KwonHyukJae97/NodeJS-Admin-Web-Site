import { IQuery } from '@nestjs/cqrs';

/**
 * 1:1 문의 전체 조회 시, 사용되는 쿼리 클래스
 */

export class GetQnaInfoQuery implements IQuery {
  constructor(readonly role: string, readonly accountId: number) {}
}
