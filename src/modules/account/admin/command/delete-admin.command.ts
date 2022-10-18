import { ICommand } from '@nestjs/cqrs';

/**
 * 관리자 정보 삭제용 커맨드 정의
 */

export class DeleteAdminCommand implements ICommand {
  constructor(readonly adminId: number, readonly delDate: Date) {}
}
