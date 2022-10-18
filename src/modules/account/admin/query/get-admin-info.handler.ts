import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin';
import { GetAdminInfoQuery } from './get-admin-info.query';

/**
 * 관리자 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetAdminInfoQuery)
export class GetAdminInfoQueryHandler implements IQueryHandler<GetAdminInfoQuery> {
  constructor(@InjectRepository(Admin) private adminRepository: Repository<Admin>) {}

  async execute(query: GetAdminInfoQuery) {
    const { adminId } = query;

    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.account', 'account')
      .where('admin.admin_id = :adminId', { adminId: adminId })
      // .where('account.account_id =:accountId', { accountId: adminId })
      .getOne();

    if (!admin) {
      throw new NotFoundException('Admin does not exist');
    }
    //관리자 상세 정보 반환
    return admin;
  }
}
