import { ICommand } from '@nestjs/cqrs';

/**
 * 회원사 정보 수정용 커맨드 정의
 */
export class UpdateCompanyCommand implements ICommand {
  constructor(
    readonly companyName: string,
    readonly businessNumber: string,
    readonly companyId: number,
  ) {}
}
