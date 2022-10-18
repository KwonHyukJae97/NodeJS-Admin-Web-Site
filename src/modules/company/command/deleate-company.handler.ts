import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { RolePermission } from 'src/modules/adminRole/entities/rolePermission.entity';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { DeleteCompanyCommand } from './delete-company.command';

/**
 * 회원사 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteCompanyCommand)
export class DeleteCompanyHandler implements ICommandHandler<DeleteCompanyCommand> {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: DeleteCompanyCommand) {
    const { companyId, roleId } = command;
    //const rolePermission = await this.rolePermissionRepository.findOneBy({ roleId: roleId });
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.rolePermission', 'role')
      .where('role.role_id = :roleId', { roleId: roleId })
      .getOne();

    const adminPermissionId = admin.rolePermission.permissionId;
    const adminCompanyId = admin.companyId;

    // (예시) permissionId = 2 : 회원사 관리자 and 삭제 권한자
    try {
      if (adminCompanyId == companyId && adminPermissionId == 2) {
        //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
        this.companyRepository.softDelete({ companyId: companyId });
        //삭제처리 완료 메시지 반환
        return '삭제가 완료 되었습니다.';
      } else {
        //삭제처리 불가 메시지 반환
        return '삭제할 수 있는 권한이 없습니다.';
      }
    } catch (err) {
      console.log(err);
      //삭제처리 에러 메시지 반환
      return this.convertException.throwError('commonError', '', 500);
    }
  }
}
