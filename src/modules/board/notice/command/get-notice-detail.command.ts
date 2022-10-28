import { ICommand } from '@nestjs/cqrs';

/**
 * 공지사항 상세 정보 조회용 커멘드 정의
 */
export class GetNoticeDetailCommand implements ICommand {
  constructor(readonly noticeId: number, readonly role: string) {}
}
