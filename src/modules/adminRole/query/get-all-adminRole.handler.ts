/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
import { GetAllAdminRoleQuery } from './get-all-adminRole.query';

/**
 * 역할 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllAdminRoleQuery)
export class GetAllAdminRoleQueryHandler implements IQueryHandler<GetAllAdminRoleQuery> {
  constructor(@InjectRepository(AdminRole) private adminrolesRepository: Repository<AdminRole>) {}

  async execute(query: GetAllAdminRoleQuery) {
    const adminrole = await this.adminrolesRepository.find({});

    if (!adminrole) {
      throw new NotFoundException('AdminRole does not exist');
    }
    // 역할 전체 리스트
    return adminrole;
  }
}
