/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { GetAllAdminRoleQuery } from './get-all-adminRole.query';

/**
 * 역할 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllAdminRoleQuery)
export class GetAllAdminRoleQueryHandler implements IQueryHandler<GetAllAdminRoleQuery> {
  constructor(
    @InjectRepository(AdminRole) private adminrolesRepository: Repository<AdminRole>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 리스트 조회 메소드
   * @param query : 역할 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 역할 리스트 반환
   */
  async execute(query: GetAllAdminRoleQuery) {
    const adminrole = await this.adminrolesRepository.find({});

    if (!adminrole) {
      return this.convertException.notFoundError('역할', 404);
    }

    // 회원사에 속한 사용자 수, 관리자 수 구하기

    const count = await this.adminrolesRepository
      .createQueryBuilder('adminRole')
      .select(['DISTINCT(adminRole.roleId) AS roleId, adminRole.roleName AS roleName'])
      .leftJoin('adminRole.admin', 'admin')
      .leftJoin('adminRole.account', 'account')
      .addSelect('COUNT(admin.roleId) AS adminCount')
      .groupBy('adminRole.roleId, admin.roleId')
      .getRawMany();

    return count;
  }
}
