import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAdminRoleCommand } from './create-adminRole.command';
import { AdminRole } from '../entities/adminrole.entity';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/rolePermission.entity';

/**
 * 역할 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateAdminRoleCommand)
export class CreateAdminRoleHandler implements ICommandHandler<CreateAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async execute(command: CreateAdminRoleCommand) {
    const { roleName, companyId, permissionId } = command;

    const adminrole = this.adminroleRepository.create({
      roleName,
      companyId,
    });
    // 역할 정보 DB저장
    await this.adminroleRepository.save(adminrole);

    const rolePermission = this.rolePermissionRepository.create({
      roleId: adminrole.roleId,
      permissionId,
    });
    //역할_권한 정보 DB저장
    await this.rolePermissionRepository.save(rolePermission);

    //등록완료 메시지 반환
    return '등록이 완료 되었습니다.';
  }
}
