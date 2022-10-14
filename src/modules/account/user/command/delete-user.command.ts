import { ICommand } from '@nestjs/cqrs';

/**
 * 앱 사용자 정보 삭제용 커맨드 정의
 */

export class DeleteUserCommand implements ICommand {
  constructor(readonly accountId: number, readonly delDate: Date) {}
}
