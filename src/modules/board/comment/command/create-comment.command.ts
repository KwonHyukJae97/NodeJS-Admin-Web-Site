import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 답변 등록용 커맨드 정의
 */
export class CreateCommentCommand implements ICommand {
  constructor(readonly qnaId: number, readonly comment: string) // readonly account: Account
  {}
}
