import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { GetAdminRoleInfoQuery } from './get-adminRole-info.query';

/**
 * 역할 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetAdminRoleInfoQuery)
export class GetAdminRoleInfoQueryHandler implements IQueryHandler<GetAdminRoleInfoQuery> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 상세 정보 조회 메소드
   * @param query : 역할 상세 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 역할 상세 정보 반환
   */
  async execute(query: GetAdminRoleInfoQuery) {
    const { roleId } = query;

    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });

    if (!adminrole) {
      return this.convertException.notFoundError('역할', 404);
    }
    return adminrole;
  }
}
