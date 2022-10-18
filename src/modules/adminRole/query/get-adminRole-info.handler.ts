import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
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

  async execute(query: GetAdminRoleInfoQuery) {
    const { roleId } = query;

    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });

    if (!adminrole) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '역할', 404);
    }
    //권한 상세 정보
    return adminrole;
  }
}
