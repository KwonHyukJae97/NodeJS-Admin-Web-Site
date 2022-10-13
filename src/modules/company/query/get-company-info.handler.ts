import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GetCompanyInfoQuery } from './get-company-info.query';

/**
 * 회원사 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetCompanyInfoQuery)
export class GetCompanyInfoQueryHandler implements IQueryHandler<GetCompanyInfoQuery> {
  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

  async execute(query: GetCompanyInfoQuery) {
    const { companyId } = query;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    if (!company) {
      throw new NotFoundException('Company does not exist');
    }
    //회원사 상세 정보
    return company;
  }
}
