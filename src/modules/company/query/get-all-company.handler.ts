import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Page } from 'src/common/utils/page';
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
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            검색어가 없을 경우, 조회 성공 시 회원사 전체 리스트 반환 /
   *            검색어가 있을 경우, 조회 성공 시 검색어에 포함되는 회원사 리스트 반환
   */
  async execute(query: GetAllCompanyQuery) {
    const { param } = query;

    // 회원사에 속한 사용자 수, 관리자 수 구해서 회원사 리스트 반환
    const company = await this.companyRepository
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
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(admin.adminId)')
          .from('admin', 'admin')
          .where('admin.companyId = companyId')
          .limit(1);
      }, 'adminCount');

    // 검색 키워드가 있을 경우
    if (param.searchWord) {
      company.where('company.companyName like :companyName', {
        companyName: `%${param.searchWord}%`,
      });
    }
    company.groupBy('company.companyId, userCompany.companyId, admin.adminId');

    let tempQuery = company;

    // 전체 조회 값이 false일 경우, 페이징 처리
    if (!param.totalData) {
      // .skip()과 .take()사용 시 쿼리반영이 되지 않는 현상으로 limit(),offset()사용
      tempQuery = tempQuery.limit(param.getLimit()).offset(param.getOffset());
    }

    // 최종 데이터 반환
    const list = await tempQuery.getRawMany();
    // 최종 데이터의 총 개수 반환
    const total = await tempQuery.getCount();
    // 전체 조회 값 여부에 따른 pageNo/pageSize 반환값 설정
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('회원사', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
