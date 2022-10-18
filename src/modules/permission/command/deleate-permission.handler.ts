import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { DeletePermissionCommand } from './delete-permission.command';

/**
 * 권한 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler implements ICommandHandler<DeletePermissionCommand> {
  constructor(
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: DeletePermissionCommand) {
    const { permissionId } = command;
    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      //정보를 찾을 수 없을 경우 에러 메시지 반환
      return this.convertException.throwError('notFound', '권한', 404);
    }
    // 권한 DB 삭제
    try {
      //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
      await this.permissionRepository.softDelete({ permissionId: permissionId });
      //삭제처리 완료 메시지 반환
      return '삭제가 완료 되었습니다.';
    } catch (err) {
      console.log('****err', err);
      //삭제처리 에러 메시지 반환
      return this.convertException.throwError('commonError', '', 500);
    }
  }
}
