import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionCommand } from './create-permission.command';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 권한 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand> {
  constructor(
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: CreatePermissionCommand) {
    const { menuName, grantType } = command;

    const permission = this.permissionRepository.create({
      menuName,
      grantType,
    });

    //권한 정보 DB저장
    try {
      await this.permissionRepository.save(permission);
    } catch (err) {
      console.log(err);
      //저장 실패할 경우 에러 메시지 반환
      return this.convertException.throwError('badInput', '권한 정보에 ', 400);
    }

    //등록된 내용 반환
    return permission;
  }
}
