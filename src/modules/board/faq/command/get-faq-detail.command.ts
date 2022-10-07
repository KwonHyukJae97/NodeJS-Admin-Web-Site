import { ICommand } from '@nestjs/cqrs';

/**
 * FAQ 상세조회 시, 사용되는 커맨드 정의
 */

export class GetFaqDetailCommand implements ICommand {
  constructor(readonly faqId: number, readonly role: string) {}
}
