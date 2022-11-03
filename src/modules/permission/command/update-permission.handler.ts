import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { UpdatePermissionCommand } from './update-permission.command';

/**
 * 권한 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
  constructor(
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   *
   * @param command : 권한 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */

  async execute(command: UpdatePermissionCommand) {
    const { menuName, grantType, permissionId } = command;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      return this.convertException.notFoundError('권한', 404);
    }

    permission.menuName = menuName;

    //권한 정보 DB저장
    try {
      await this.permissionRepository.save(permission);
    } catch (err) {
      return this.convertException.badRequestError('권한 정보에 ', 400);
    }

    return permission;
  }
}
