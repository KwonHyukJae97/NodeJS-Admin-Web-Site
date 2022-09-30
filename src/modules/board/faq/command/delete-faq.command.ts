import { ICommand } from '@nestjs/cqrs';

/**
 * FAQ 삭제 시, 사용되는 커맨드 정의
 */

export class DeleteFaqCommand implements ICommand {
  constructor(readonly faqId: number) {}
}
