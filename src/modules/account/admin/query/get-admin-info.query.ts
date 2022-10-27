import { IQuery } from '@nestjs/cqrs';

/**
 * 관리자 상세 정보 조회용 쿼리 정의
 */
export class GetAdminInfoQuery implements IQuery {
  constructor(readonly adminId: number) {}
}
