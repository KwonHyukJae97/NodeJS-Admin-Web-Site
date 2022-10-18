import { ICommand } from '@nestjs/cqrs';

/**
 * 관리자 정보 수정용 커맨드 정의
 */

export class UpdateAdminCommand implements ICommand {
  constructor(
    readonly password: string,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly roleId: number,
    readonly isSuper: boolean,
    readonly adminId: number,
  ) {}
}
