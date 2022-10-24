import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { CreateAdminRoleCommand } from './create-adminRole.command';

/**
 * 역할 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateAdminRoleCommand)
export class CreateAdminRoleHandler implements ICommandHandler<CreateAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 등록 메소드
   * @param command : 역할 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 성공 시 완료 메시지 반환
   */
  async execute(command: CreateAdminRoleCommand) {
    const { roleName, grantType, companyId, permissionId } = command;

    const adminrole = this.adminroleRepository.create({
      roleName,
      companyId,
    });
    // 역할 정보 DB저장
    try {
      await this.adminroleRepository.save(adminrole);
    } catch (err) {
      return this.convertException.badRequestError('역할정보에 ', 400);
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId: adminrole.roleId,
      grantType: grantType,
      permissionId: permissionId,
    });
    // 역할_권한 정보 DB저장
    try {
      await this.rolePermissionRepository.save(rolePermission);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '등록이 완료 되었습니다.';
  }
}
