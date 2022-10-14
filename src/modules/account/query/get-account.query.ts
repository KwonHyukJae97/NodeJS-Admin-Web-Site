import { IQuery } from '@nestjs/cqrs';

/**
 * Account 에서 로그인 기간이 1년이상 지난 사용자 추출 쿼리
 */
export class GetAccountQuery implements IQuery {
  constructor(readonly accountId: number, readonly loginDate: Date) {}
}
