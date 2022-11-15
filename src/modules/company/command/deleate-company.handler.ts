import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Admin } from 'src/modules/account/admin/entities/admin';
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
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 회원사 삭제 메소드
   * @param command : 회원사 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 권한 없음 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   *  (예시) permissionId = 4 : 회원사 관리자 and 삭제 권한자 (권한 정의 이후 permissionId값 수정해야함)
   */
  async execute(command: DeleteCompanyCommand) {
    const { companyId, roleId } = command;

    // 관리자의 역할 및 권한 조회
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.rolePermission', 'role')
      .where('role.role_id = :roleId', { roleId: roleId })
      // TODO: 권한 정의 이후 permissionId값 수정해야함
      .andWhere('role.permission_id = 4')
      .getOne();

    if (!admin) {
      return this.convertException.notFoundError('회원사', 404);
    }

    // 관리자가 소유한 역할 및 권한 정보
    const adminPermissionId = admin.rolePermission.permissionId;

    // 관리자가 속한 회원사 정보
    const adminCompanyId = admin.companyId;

    try {
      // TODO: 권한 정의 이후 permissionId값 수정해야함
      // 삭제요청한 회원사ID 와 관리자가 속한 회원사의 ID 일치여부 및 관리자가 소유한 권한정보 체크
      if (adminCompanyId == companyId && adminPermissionId == 4) {
        this.companyRepository.softDelete({ companyId: companyId });
        return '삭제가 완료 되었습니다.';
      } else {
        return '삭제할 수 있는 권한이 없습니다.';
      }
    } catch (err) {
      return this.convertException.CommonError(500);
    }
  }
}
