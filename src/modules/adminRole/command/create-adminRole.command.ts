import { ICommand } from '@nestjs/cqrs';
import { rolePermissionDto } from '../dto/rolePermission.dto';

/**
 * 역할 등록용 커맨드 정의
 */
export class CreateAdminRoleCommand implements ICommand {
  constructor(
    readonly roleName: string,
    readonly companyId: number,
    readonly roleDto: rolePermissionDto[],
  ) {}
}
