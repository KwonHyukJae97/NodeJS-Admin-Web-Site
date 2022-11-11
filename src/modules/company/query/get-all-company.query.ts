import { IQuery } from '@nestjs/cqrs';
import { GetCompanyRequestDto } from '../dto/get-company-request.dto';

/**
 * 회원사 전체 조회용 쿼리
 */
export class GetAllCompanyQuery implements IQuery {
  constructor(readonly param: GetCompanyRequestDto) {}
}
