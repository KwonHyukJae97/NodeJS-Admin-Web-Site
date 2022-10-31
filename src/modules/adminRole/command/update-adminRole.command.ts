import { ICommand } from '@nestjs/cqrs';
import { UpdateAdminRoleDto } from '../dto/update-adminRole.dto';

/**
 * 역할 정보 수정용 커맨드 정의
 */
export class UpdateAdminRoleCommand implements ICommand {
  constructor(
    readonly roleName: string,
    readonly roleDto: UpdateAdminRoleDto[],
    readonly roleId: number,
  ) {}
}
