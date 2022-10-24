import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAdminRoleCommand } from './update-adminRole.command';
import { AdminRole } from '../entities/adminrole.entity';
import { Repository } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { RolePermission } from '../entities/rolePermission.entity';

/**
 * 역할 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminRoleCommand)
export class UpdateAdminRoleHandler implements ICommandHandler<UpdateAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 정보 수정 메소드
   * @param command : 역할 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: UpdateAdminRoleCommand) {
    const { roleName, grantType, permissionId, roleId } = command;
    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });
    if (!adminrole) {
      return this.convertException.notFoundError('역할', 404);
    }

    adminrole.roleName = roleName;

    //역할 정보 DB저장
    try {
      await this.adminroleRepository.save(adminrole);
    } catch (err) {
      return this.convertException.badRequestError('역할정보에 ', 400);
    }

    const rolePermission = await this.rolePermissionRepository.findOneBy({ roleId: roleId });
    if (!rolePermission) {
      return this.convertException.notFoundError('역할_권한정보에 ', 404);
    }

    rolePermission.grantType = grantType;
    rolePermission.permissionId = permissionId;
    //역할_권한 정보 DB저장
    try {
      await this.rolePermissionRepository.save(rolePermission);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return adminrole;
  }
}
