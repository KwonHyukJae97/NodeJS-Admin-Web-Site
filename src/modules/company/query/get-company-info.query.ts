import { IQuery } from '@nestjs/cqrs';

/**
 * 회원사 상세 정보 조회용 쿼리
 */
export class GetCompanyInfoQuery implements IQuery {
  constructor(readonly companyId: number) {}
}
