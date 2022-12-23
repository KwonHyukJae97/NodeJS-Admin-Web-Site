import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAdminRoleCommand } from './update-adminRole.command';
import { AdminRole } from '../entities/adminRole.entity';
import { Repository, DataSource } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { RolePermission } from '../entities/rolePermission.entity';
import { rolePermissionDto } from '../dto/rolePermission.dto';

/**
 * 역할 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminRoleCommand)
export class UpdateAdminRoleHandler implements ICommandHandler<UpdateAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 역할 정보 수정 메소드
   * @param command : 역할 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: UpdateAdminRoleCommand) {
    const { roleName, roleDto, roleId, updateBy } = command;

    // 역할정보 찾기
    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });
    if (!adminrole) {
      return this.convertException.notFoundError('역할', 404);
    }

    adminrole.roleName = roleName;
    adminrole.updateBy = updateBy;

    // roleId찾기
    const findRoleId = await this.rolePermissionRepository.findBy({ roleId: roleId });
    if (!findRoleId) {
      return this.convertException.notFoundError('역할_권한정보에 ', 404);
    }

    // 역할_권한 정보 찾기
    roleDto.forEach(async (value: rolePermissionDto) => {
      const findRolePermission = await this.rolePermissionRepository
        .createQueryBuilder('rolePermission')
        .where('rolePermission.roleId=:roleId', { roleId: roleId })
        .andWhere('rolePermission.permissionId=:permissionId', { permissionId: value.permissionId })
        .andWhere('rolePermission.grantType=:grantType', { grantType: value.grantType })
        .getOne();

      //transaction처리
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 역할 정보(역할이름) DB저장
        await queryRunner.manager.getRepository(AdminRole).save(adminrole);

        // 역할_권한 정보가 존재하지 않을 경우 데이터 추가
        if (!findRolePermission) {
          // 역할_권한 정보 DB저장
          const createRole = await queryRunner.manager.getRepository(RolePermission).create({
            roleId,
            permissionId: value.permissionId,
            grantType: value.grantType,
          });

          await queryRunner.manager.getRepository(RolePermission).insert(createRole);

          // 역할_권한 정보가 존재할 경우 데이터 수정
        } else if (
          (findRolePermission != null && findRolePermission.permissionId != value.permissionId) ||
          (findRolePermission != null && findRolePermission.grantType != value.grantType)
        )
          // 역할_권한 정보 DB수정
          await queryRunner.manager.getRepository(RolePermission).update(
            {
              permissionId: value.permissionId,
            },
            { grantType: value.grantType },
          );

        await queryRunner.commitTransaction();
      } catch (err) {
        // 실패시 rollback
        await queryRunner.rollbackTransaction();
        return this.convertException.CommonError(500);
      } finally {
        await queryRunner.release();
      }

      return findRolePermission;
    });
  }
}
