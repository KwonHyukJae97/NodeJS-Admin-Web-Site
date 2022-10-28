import { ICommand } from '@nestjs/cqrs';

/**
 * FAQ 상세 정보 조회용 커멘드 정의
 */
export class GetFaqDetailCommand implements ICommand {
  constructor(readonly faqId: number, readonly role: string) {}
}
