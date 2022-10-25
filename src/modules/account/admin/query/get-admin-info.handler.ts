import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin';
import { GetAdminInfoQuery } from './get-admin-info.query';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 관리자 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetAdminInfoQuery)
export class GetAdminInfoQueryHandler implements IQueryHandler<GetAdminInfoQuery> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetAdminInfoQuery) {
    const { adminId } = query;

    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.account', 'account')
      .where('admin.admin_id = :adminId', { adminId: adminId })
      // .where('account.account_id =:accountId', { accountId: adminId })
      .getOne();

    if (!admin) {
      return this.convertException.throwError('notFound', '관리자', 404);
    }
    //관리자 상세 정보 반환
    return admin;
  }
}
