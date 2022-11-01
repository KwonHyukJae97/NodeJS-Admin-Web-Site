import { ICommand } from '@nestjs/cqrs';

/**
 * 네이버 (관리자) 2차정보 가입 커맨드 정의
 */
export class NaverSignUpAdminCommand implements ICommand {
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
