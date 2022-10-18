import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { DeleteAdminRoleCommand } from './delete-adminRole.command';

/**
 * 역할 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteAdminRoleCommand)
export class DeleteAdminRoleHandler implements ICommandHandler<DeleteAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 역할 삭제 메소드
   * @param command : 역할 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteAdminRoleCommand) {
    const { roleId } = command;
    const role = await this.adminroleRepository.findOneBy({ roleId: roleId });

    if (!role) {
      return this.convertException.notFoundError('역할', 404);
    }
    //역할정보 DB삭제
    try {
      await this.adminroleRepository.softDelete({ roleId: roleId });
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    //역할_권한정보 DB삭제
    try {
      await this.rolePermissionRepository.softDelete({ roleId: roleId });
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '삭제가 완료 되었습니다.';
  }
}
