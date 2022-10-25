import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin';
import { GetAllAdminQuery } from './get-all-admin.query';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 관리자 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllAdminQuery)
export class GetAllAdminQueryHandler implements IQueryHandler<GetAllAdminQuery> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetAllAdminQuery) {
    const admin = await this.adminRepository.find({});
    if (!admin) {
      return this.convertException.throwError('notFound', '관리자', 404);
    }
    // 관리자 전체 리스트 반환
    console.log('adminList', admin);
    return admin;
  }
}
