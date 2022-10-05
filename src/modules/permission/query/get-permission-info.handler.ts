import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { GetPermissionInfoQuery } from './get-permission-info.query';

/**
 * 권한 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetPermissionInfoQuery)
export class GetPermissionInfoQueryHandler implements IQueryHandler<GetPermissionInfoQuery> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {}

  async execute(query: GetPermissionInfoQuery) {
    const { permissionId } = query;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      throw new NotFoundException('Permission does not exist');
    }
    //권한 상세 정보
    return permission;
  }
}
