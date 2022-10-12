import { ICommand } from '@nestjs/cqrs';

/**
 * 역할 삭제용 커맨드 정의
 */
export class DeleteAdminRoleCommand implements ICommand {
  constructor(readonly roleId: number) {}
}
