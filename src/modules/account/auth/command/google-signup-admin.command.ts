import { ICommand } from '@nestjs/cqrs';

/**
 * 구글 (관리자) 2차정보 가입 커맨드 정의
 */
export class GoogleSignUpAdminCommand implements ICommand {
  constructor(
    readonly name: string,
    readonly phone: string,
    readonly nickname: string,
    readonly birth: string,
    readonly gender: string,
    readonly snsId: string,
    readonly snsToken: string,
    readonly companyName: string,
    readonly companyCode: number,
  ) {}
}
