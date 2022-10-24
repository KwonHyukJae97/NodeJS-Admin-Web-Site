import { ICommand } from '@nestjs/cqrs';

/**
 * 1:1 문의 상세 정보 조회용 커멘드 정의
 */
export class GetQnaDetailCommand implements ICommand {
  constructor(readonly qnaId: number, readonly role: string, readonly accountId: number) {}
}
