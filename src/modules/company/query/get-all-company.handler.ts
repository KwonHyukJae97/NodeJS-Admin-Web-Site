/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { distinct } from 'rxjs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Admin } from 'src/modules/account/admin/entities/admin';
import { UserCompany } from 'src/modules/account/user/entities/user-company';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GetAllCompanyQuery } from './get-all-company.query';

/**
 * 회원사 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllCompanyQuery)
export class GetAllCompanyQueryHandler implements IQueryHandler<GetAllCompanyQuery> {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(UserCompany) private userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 회원사 리스트 조회 메소드
   * @param query : 회원사 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 회원사 리스트 반환
   */
  async execute(query: GetAllCompanyQuery) {
    const company = await this.companyRepository.find({});

    if (!company) {
      return this.convertException.notFoundError('회원사', 404);
    }

    // 회원사에 속한 사용자 수, 관리자 수 구하기
    const count = await this.companyRepository
      .createQueryBuilder('company')
      .select([
        `DISTINCT(company.company_id) AS company_id, company.company_name AS company_name, 
       company.company_code AS company_code, company.business_number AS business_number, 
       company.reg_date AS reg_date`,
      ])
      .leftJoin('company.userCompany', 'userCompany')
      .leftJoin('company.admin', 'admin')
      .addSelect('COUNT(company.companyId) AS user_count')
      .addSelect('COUNT(admin.adminId) AS admin_count')
      .groupBy('company.companyId, admin.adminId')
      .getRawMany();

    return count;
  }
}
