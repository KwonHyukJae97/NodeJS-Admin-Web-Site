import { IQuery } from '@nestjs/cqrs';

/**
 * 회원사 전체 조회용 쿼리
 */
export class GetAllCompanyQuery implements IQuery {
  constructor(readonly searchWord?: string) {}
}
