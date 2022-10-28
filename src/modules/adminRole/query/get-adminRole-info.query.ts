import { IQuery } from '@nestjs/cqrs';

/**
 * 역할 상세 정보 조회용 쿼리
 */
export class GetAdminRoleInfoQuery implements IQuery {
  constructor(readonly roleId: number) {}
}
