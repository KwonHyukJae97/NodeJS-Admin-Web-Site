import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository, DataSource } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { DeleteAdminRoleCommand } from './delete-adminRole.command';

/**
 * 역할 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteAdminRoleCommand)
export class DeleteAdminRoleHandler implements ICommandHandler<DeleteAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 역할 삭제 메소드
   * @param command : 역할 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteAdminRoleCommand) {
    const { roleId } = command;
    const role = await this.adminroleRepository.findOneBy({ roleId: roleId });

    if (!role) {
      return this.convertException.notFoundError('역할', 404);
    }
    //transaction처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //역할정보 DB삭제
      await queryRunner.manager.getRepository(AdminRole).softDelete({ roleId: roleId });

      //역할_권한정보 DB삭제
      await queryRunner.manager.getRepository(RolePermission).softDelete({ roleId: roleId });

      await queryRunner.commitTransaction();
    } catch (err) {
      // 실패시 rollback
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }
    return '삭제가 완료 되었습니다.';
  }
}
