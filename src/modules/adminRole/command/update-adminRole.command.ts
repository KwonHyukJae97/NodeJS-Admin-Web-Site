import { ICommand } from '@nestjs/cqrs';

/**
 * 역할 정보 수정용 커맨드 정의
 */
export class UpdateAdminRoleCommand implements ICommand {
  constructor(
    readonly roleName: string,
    readonly grantType: string,
    readonly permissionId: number,
    readonly roleId: number,
  ) {}
}
