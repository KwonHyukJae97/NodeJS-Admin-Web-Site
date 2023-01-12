import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Admin } from 'src/modules/account/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/rolePermission.entity';
import { GetAdminRoleInfoQuery } from './get-adminRole-info.query';

/**
 * 역할 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetAdminRoleInfoQuery)
export class GetAdminRoleInfoQueryHandler implements IQueryHandler<GetAdminRoleInfoQuery> {
  constructor(
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Admin) private AdminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 상세 정보 조회 메소드
   * @param query : 역할 상세 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 역할 상세 정보 반환
   */
  async execute(query: GetAdminRoleInfoQuery) {
    const { roleId, getAdminInfo } = query;

    const rolePermission = await this.rolePermissionRepository
      .createQueryBuilder('RP')
      .leftJoinAndSelect('RP.permission', 'P')
      .where('RP.roleId = :roleId', { roleId: roleId })
      .orderBy({ 'RP.permission_id': 'ASC', RP_grant_type: 'ASC' })
      .getRawMany();

    if (!rolePermission) {
      return this.convertException.notFoundError('역할', 404);
    }

    // 등록된 사용자 계정 정보 가져오기
    if (getAdminInfo === 'Y') {
      const accountInfo = await this.AdminRepository.createQueryBuilder('admin')
        .select(['admin.admin_id AS adminId, account.name AS adminName, account.id AS id'])
        .leftJoin('admin.account', 'account')
        .where('admin.roleId = :roleId', { roleId: roleId })
        .getRawMany();

      return accountInfo;
    }

    // 역할_권한 정보를 권한(화면이름)으로 묶음 처리
    const permissionMap = new Map();
    rolePermission.forEach((value) => {
      const permissionId = value.P_permission_id;
      if (!permissionMap.has(permissionId)) {
        const permissionInfo = {
          permission_id: permissionId,
          menu_name: value.P_menu_name,
          display_name: value.P_display_name,
          grant_type_list: [],
        };

        permissionMap.set(permissionId, permissionInfo);
      }

      permissionMap.get(permissionId).grant_type_list.push({
        grant_type: value.RP_grant_type,
      });
    });

    const permissionList = [];
    permissionMap.forEach((data) => {
      permissionList.push(data);
    });
    return permissionList;
  }
}
