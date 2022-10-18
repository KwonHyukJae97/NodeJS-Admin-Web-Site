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

  async execute(query: GetPermissionInfoQuery) {
    const { permissionId } = query;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '권한', 404);
    }
    //권한 상세 정보 반환
    return permission;
  }
}
