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

  /**
   * 권한 등록 메소드
   * @param command : 권한 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 권한 정보 반환
   */
  async execute(command: CreatePermissionCommand) {
    const { menuName, grantType } = command;

    const permission = this.permissionRepository.create({
      menuName,
    });

    //권한 정보 DB저장
    try {
      await this.permissionRepository.save(permission);
    } catch (err) {
      return this.convertException.badRequestError('권한 정보에 ', 400);
    }

    return permission;
  }
}
