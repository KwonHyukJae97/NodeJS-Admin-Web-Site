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
    const company = await this.companyRepository.find({});

    if (!company) {
      return this.convertException.notFoundError('회원사', 404);
    }

    return company;
  }
}
