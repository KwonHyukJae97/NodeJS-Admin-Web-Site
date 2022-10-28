import { ICommand } from '@nestjs/cqrs';

/**
 * 관리자 로그인 커맨드 정의
 */
export class SignInAdminCommand implements ICommand {
  constructor(readonly id: string, readonly password: string) {}
}
