import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteAdminRoleCommand } from './delete-adminRole.command';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
import { RolePermission } from '../entities/rolePermission.entity';

/**
 * 역할 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteAdminRoleCommand)
export class DeleteAdminRoleHandler implements ICommandHandler<DeleteAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async execute(command: DeleteAdminRoleCommand) {
    const { roleId } = command;
    await this.adminroleRepository.findOneBy({ roleId: roleId });

    //역할정보 DB삭제
    await this.adminroleRepository.softDelete({ roleId: roleId });

    //역할_권한정보 DB삭제
    await this.rolePermissionRepository.softDelete({ roleId: roleId });

    //삭제처리 완료 메시지 반환
    return '삭제가 완료 되었습니다.';
  }
}
