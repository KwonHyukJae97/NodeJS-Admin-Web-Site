import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionCommand } from './create-permission.command';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';

/**
 * 권한 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {}

  async execute(command: CreatePermissionCommand) {
    const { menuName, grantType } = command;

    const permission = this.permissionRepository.create({
      menuName,
      grantType,
    });

    await this.permissionRepository.save(permission);

    //등록된 내용 반환
    return permission;
  }
}
