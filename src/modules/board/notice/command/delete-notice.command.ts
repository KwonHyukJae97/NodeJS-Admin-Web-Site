import { ICommand } from '@nestjs/cqrs';

/**
 * 공지사항 삭제용 커맨드 정의
 */
export class DeleteNoticeCommand implements ICommand {
  constructor(readonly noticeId: number, readonly role: string, readonly accountId: number) {}
}
