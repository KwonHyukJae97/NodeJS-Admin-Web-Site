import { ICommand } from '@nestjs/cqrs';

/**
 * 관리자 비밀번호 수정용 커맨드 정의
 */

export class AdminUpdatePasswordCommand implements ICommand {
  constructor(readonly accountId: number, readonly password: string) {}
}
