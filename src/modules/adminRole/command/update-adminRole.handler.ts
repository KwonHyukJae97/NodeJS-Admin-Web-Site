import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAdminRoleCommand } from './update-adminRole.command';
import { AdminRole } from '../entities/adminrole.entity';
import { Repository } from 'typeorm';

/**
 * 역할 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminRoleCommand)
export class UpdateAdminRoleHandler implements ICommandHandler<UpdateAdminRoleCommand> {
  constructor(@InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>) {}

  async execute(command: UpdateAdminRoleCommand) {
    const { roleName, roleId } = command;

    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });

    adminrole.roleName = roleName;
    await this.adminroleRepository.save(adminrole);

    //수정된 내용 반환
    return adminrole;
  }
}
