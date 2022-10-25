import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { GetPermissionInfoQuery } from './get-permission-info.query';

/**
 * 권한 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetPermissionInfoQuery)
export class GetPermissionInfoQueryHandler implements IQueryHandler<GetPermissionInfoQuery> {
  constructor(
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 권한 상세 정보 조회 메소드
   * @param query : 권한 상세 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 권한 상세 정보 반환
   */

  async execute(query: GetPermissionInfoQuery) {
    const { permissionId } = query;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      return this.convertException.notFoundError('권한', 404);
    }

    return permission;
  }
}
