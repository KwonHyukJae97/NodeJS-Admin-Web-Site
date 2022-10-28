import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * FAQ 삭제용 커맨드 정의
 */
export class DeleteFaqCommand implements ICommand {
  constructor(readonly faqId: number, readonly role: string, readonly account: Account) {}
}
