import { IQuery } from '@nestjs/cqrs';

/**
 * 내 정보 조회용 쿼리
 */
export class GetAuthInfoQuery implements IQuery {
  constructor(readonly accountId: number) {}
}
