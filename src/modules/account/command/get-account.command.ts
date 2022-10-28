import { ICommand } from '@nestjs/cqrs';

/**
 * 사용자 정보 조회 커맨드 정의
 */
export class GetAccountCommand implements ICommand {
  constructor(readonly accountId: number, readonly loginDate: Date) {}
}
