import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 공지사항 삭제용 커맨드 정의
 */
export class DeleteNoticeCommand implements ICommand {
  constructor(readonly noticeId: number, readonly role: string) {}
}
