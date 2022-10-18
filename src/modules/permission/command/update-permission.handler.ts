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

  async execute(command: UpdatePermissionCommand) {
    const { menuName, grantType, permissionId } = command;

    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      //정보를 찾을 수 없는 경우 에러 메시지 반환
      return this.convertException.throwError('notFound', '권한', 404);
    }

    permission.menuName = menuName;
    permission.grantType = grantType;

    //권한 정보 DB저장
    try {
      await this.permissionRepository.save(permission);
    } catch (err) {
      console.log(err);
      //저장 실패할 경우 에러 메시지 반환
      return this.convertException.throwError('badInput', '권한 정보에 ', 400);
    }

    //수정된 내용 반환
    return permission;
  }
}
