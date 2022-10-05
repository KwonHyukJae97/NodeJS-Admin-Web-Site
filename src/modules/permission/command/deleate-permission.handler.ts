import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeletePermissionCommand } from './delete-permission.command';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

/**
 * 권한 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler implements ICommandHandler<DeletePermissionCommand> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {}

  async execute(command: DeletePermissionCommand) {
    const { permissionId } = command;
    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
    this.permissionRepository.softDelete({ permissionId: permissionId });

    //삭제처리 완료 메시지 반환
    return '삭제가 완료 되었습니다.';
  }
}
