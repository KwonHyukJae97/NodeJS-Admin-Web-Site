import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteAdminRoleCommand } from './delete-adminRole.command';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminrole.entity';

/**
 * 역할 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteAdminRoleCommand)
export class DeleteAdminRoleHandler implements ICommandHandler<DeleteAdminRoleCommand> {
  constructor(@InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>) {}

  async execute(command: DeleteAdminRoleCommand) {
    const { roleId } = command;
    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });

    //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
    this.adminroleRepository.softDelete({ roleId: roleId });

    //삭제처리 완료 메시지 반환
    return '삭제가 완료 되었습니다.';
  }
}
