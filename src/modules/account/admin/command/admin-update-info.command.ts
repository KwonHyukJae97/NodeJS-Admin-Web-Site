import { ICommand } from '@nestjs/cqrs';

/**
 * 관리자 상세정보 수정용 커맨드 정의
 */

export class AdminUpdateInfoCommand implements ICommand {
  constructor(
    readonly accountId: number,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly file: Express.MulterS3.File,
  ) {}
}
