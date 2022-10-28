import { ICommand } from '@nestjs/cqrs';

/**
 * 회원사 삭제용 커맨드 정의
 */
export class DeletePermissionCommand implements ICommand {
  constructor(readonly permissionId: number) {}
}
