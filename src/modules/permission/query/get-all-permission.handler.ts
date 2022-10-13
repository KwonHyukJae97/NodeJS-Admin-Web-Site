/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { GetAllPermissionQuery } from './get-all-permission.query';

/**
 * 권한 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllPermissionQuery)
export class GetAllPermissionQueryHandler implements IQueryHandler<GetAllPermissionQuery> {
  constructor(
    @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
  ) {}

  async execute(query: GetAllPermissionQuery) {
    const permission = await this.permissionsRepository.find({});

    if (!permission) {
      throw new NotFoundException('Permission does not exist');
    }
    // 권한 전체 리스트
    return permission;
  }
}
