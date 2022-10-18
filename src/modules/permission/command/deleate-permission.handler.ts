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

  /**
   * 권한 삭제 메소드
   * @param command : 권한 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeletePermissionCommand) {
    const { permissionId } = command;
    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionId });

    if (!permission) {
      return this.convertException.notFoundError('권한', 404);
    }
    // 권한 DB 삭제
    try {
      //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
      await this.permissionRepository.softDelete({ permissionId: permissionId });
      return '삭제가 완료 되었습니다.';
    } catch (err) {
      return this.convertException.CommonError(500);
    }
  }
}
