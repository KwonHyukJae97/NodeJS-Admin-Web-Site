import { ICommand } from '@nestjs/cqrs';

/**
 * 1:1 문의 상세조회 시, 사용되는 커맨드 정의
 */

export class GetQnaDetailCommand implements ICommand {
  constructor(readonly qnaId: number, readonly role: string, readonly accountId: number) {}
}
