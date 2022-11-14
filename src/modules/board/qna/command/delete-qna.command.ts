import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 1:1 문의 삭제용 커맨드 정의
 */
export class DeleteQnaCommand implements ICommand {
  constructor(readonly qnaId: number, readonly account: number) {}
}
