import { IQuery } from '@nestjs/cqrs';

/**
 * 앱 사용자 상세 정보 조회용 쿼리
 */
export class GetUserInfoQuery implements IQuery {
  constructor(readonly accountId: number) {}
}
