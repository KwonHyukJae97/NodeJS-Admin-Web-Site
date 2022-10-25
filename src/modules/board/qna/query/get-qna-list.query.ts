import { IQuery } from '@nestjs/cqrs';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리
 */
export class GetQnaListQuery implements IQuery {
  constructor(readonly role: string, readonly accountId: number) {}
}
