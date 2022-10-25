import { ICommand } from '@nestjs/cqrs';

/**
 * 사용자 로그인 커맨드 정의
 */
export class SignInUserCommand implements ICommand {
  constructor(readonly id: string, readonly password: string) {}
}
