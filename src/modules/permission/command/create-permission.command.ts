import { ICommand } from '@nestjs/cqrs';

/**
 * 권한 등록용 커맨드 정의
 */
export class CreatePermissionCommand implements ICommand {
  constructor(readonly menuName: string, readonly grantType: string) {}
}
