import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePermissionCommand } from './update-permission.command';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';

/**
 * 권한 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {}

  async execute(command: UpdatePermissionCommand) {
    const { menuName, grantType, permissionId } = command;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    permission.menuName = menuName;
    permission.grantType = grantType;
    await this.permissionRepository.save(permission);

    //수정된 내용 반환
    return permission;
  }
}
