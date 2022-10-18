import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GetCompanyInfoQuery } from './get-company-info.query';

/**
 * 회원사 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetCompanyInfoQuery)
export class GetCompanyInfoQueryHandler implements IQueryHandler<GetCompanyInfoQuery> {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetCompanyInfoQuery) {
    const { companyId } = query;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    if (!company) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '회원사', 404);
    }
    //회원사 상세 정보 반환
    return company;
  }
}
