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

  /**
   * 회원사 상세 정보 조회 메소드
   * @param query : 회원사 상세 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 완료 시 회원사 상세 정보 반환
   */
  async execute(query: GetCompanyInfoQuery) {
    const { companyId } = query;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    if (!company) {
      return this.convertException.notFoundError('회원사', 404);
    }

    // 회원사에 속한 사용자 수, 관리자 수 구하기
    const count = await this.companyRepository
      .createQueryBuilder('company')
      .select([
        `DISTINCT(company.company_id) AS company_id, 
        company.company_name AS company_name, 
       company.company_code AS company_code, 
       company.business_number AS business_number, 
       company.reg_date AS reg_date`,
      ])
      .leftJoin('company.userCompany', 'userCompany')
      .leftJoin('company.admin', 'admin')
      .addSelect('COUNT(userCompany.companyId) AS user_count')
      .addSelect('COUNT(admin.adminId) AS admin_count')
      .where('company.company_id = :companyId', { companyId: companyId })
      .groupBy('company.companyId, userCompany.companyId, admin.adminId')
      .getRawMany();

    return count;
  }
}
