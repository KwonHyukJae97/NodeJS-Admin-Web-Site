import { ICommand } from '@nestjs/cqrs';

/**
 * 앱 사용자 정보 수정용 커맨드 정의
 */

export class UpdateUserCommand implements ICommand {
  constructor(
    readonly password: string,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly grade: number,
    readonly accountId: number,
  ) {}
}
