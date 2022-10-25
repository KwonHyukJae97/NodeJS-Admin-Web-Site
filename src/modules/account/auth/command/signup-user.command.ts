import { ICommand } from '@nestjs/cqrs';

/**
 * 사용자 회원가입 커멘드 정의
 */
export class SignUpUserCommand implements ICommand {
  constructor(
    readonly id: string,
    readonly password: string,
    readonly name: string,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly birth: string,
    readonly gender: string,
    readonly grade: number,
  ) {}
}
