import { ICommand } from '@nestjs/cqrs';

/**
 * 공지사항 상세조회 시, 사용되는 커맨드 정의
 */

export class GetNoticeDetailCommand implements ICommand {
  constructor(readonly noticeId: number, readonly role: string) {}
}
