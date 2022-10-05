import { ICommand } from '@nestjs/cqrs';

/**
 * 권한 정보 수정용 커맨드 정의
 */
export class UpdatePermissionCommand implements ICommand {
  constructor(
    readonly menuName: string,
    readonly grantType: string,
    readonly permissionId: number,
  ) {}
}
