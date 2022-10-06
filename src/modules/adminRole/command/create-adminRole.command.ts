import { ICommand } from '@nestjs/cqrs';

/**
 * 역할 등록용 커맨드 정의
 */
export class CreateAdminRoleCommand implements ICommand {
  constructor(readonly roleName: string, readonly companyId: number) {}
}
