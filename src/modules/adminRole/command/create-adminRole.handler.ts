import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAdminRoleCommand } from './create-adminRole.command';
import { AdminRole } from '../entities/adminrole.entity';
import { Repository } from 'typeorm';

/**
 * 역할 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateAdminRoleCommand)
export class CreateAdminRoleHandler implements ICommandHandler<CreateAdminRoleCommand> {
  constructor(@InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>) {}

  async execute(command: CreateAdminRoleCommand) {
    const { roleName, companyId } = command;

    const adminrole = this.adminroleRepository.create({
      roleName,
      companyId,
    });

    await this.adminroleRepository.save(adminrole);

    //등록된 내용 반환
    return adminrole;
  }
}
