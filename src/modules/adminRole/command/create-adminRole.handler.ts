import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DataSource } from 'typeorm';
import { rolePermissionDto } from '../dto/rolePermission.dto';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { CreateAdminRoleCommand } from './create-adminRole.command';

/**
 * 역할 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateAdminRoleCommand)
export class CreateAdminRoleHandler implements ICommandHandler<CreateAdminRoleCommand> {
  constructor(
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 역할 등록 메소드
   * @param command : 역할 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 성공 시 완료 메시지 반환
   */
  async execute(command: CreateAdminRoleCommand) {
    const { roleName, companyId, regBy, roleDto } = command;

    //transaction처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 역할 정보 DB생성
      const adminrole = await queryRunner.manager.getRepository(AdminRole).create({
        roleName,
        regBy,
        companyId,
      });

      // 역할 정보 DB저장
      await queryRunner.manager.getRepository(AdminRole).save(adminrole);

      // 역할_권한 정보 DB생성
      await roleDto.forEach(async (value: rolePermissionDto) => {
        const rolePermission = await queryRunner.manager.getRepository(RolePermission).create({
          roleId: adminrole.roleId,
          permissionId: value.permissionId,
          grantType: value.grantType,
        });

        // 역할_권한 정보 DB저장
        await queryRunner.manager.getRepository(RolePermission).insert(rolePermission);
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      // 실패시 rollback
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }
    return '등록이 완료 되었습니다.';
  }
}
