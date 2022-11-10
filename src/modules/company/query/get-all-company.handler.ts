/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GetAllCompanyQuery } from './get-all-company.query';

/**
 * 회원사 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllCompanyQuery)
export class GetAllCompanyQueryHandler implements IQueryHandler<GetAllCompanyQuery> {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 회원사 리스트 조회 메소드
   * @param query : 회원사 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 회원사 리스트 반환
   */
  async execute(query: GetAllCompanyQuery) {
    const { searchWord } = query;
    const company = await this.companyRepository.find({});

    if (!company) {
      return this.convertException.notFoundError('회원사', 404);
    }

    // 회원사에 속한 사용자 수, 관리자 수 구해서 리스트 반환
    const companyList = await this.companyRepository
      .createQueryBuilder('company')
      .select([
        `DISTINCT(company.companyId) AS companyId, 
        company.companyName AS companyName, 
       company.companyCode AS companyCode, 
       company.businessNumber AS businessNumber, 
       company.regDate AS regDate`,
      ])
      .leftJoin('company.userCompany', 'userCompany')
      .leftJoin('company.admin', 'admin')
      .addSelect('COUNT(userCompany.companyId) AS userCount')
      .addSelect('COUNT(admin.adminId) AS adminCount');

    // 검색 키워드가 있을 경우
    if (searchWord) {
      companyList.where('company.companyName like :companyName', {
        companyName: `%${searchWord}%`,
      });
      companyList.groupBy('company.companyId, userCompany.companyId, admin.adminId');
      companyList.getRawMany();
      console.log('companyList', companyList);
    }
    companyList.groupBy('company.companyId, userCompany.companyId, admin.adminId');
    const tempQuery = companyList;

    // 최종 데이터 반환
    const list = await tempQuery.getRawMany();

    return list;
  }
}
