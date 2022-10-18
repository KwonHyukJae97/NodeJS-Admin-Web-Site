/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
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

  async execute(query: GetAllAdminRoleQuery) {
    const adminrole = await this.adminrolesRepository.find({});

    if (!adminrole) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '역할', 404);
    }
    // 역할 전체 리스트
    return adminrole;
  }
}
