import { ICommand } from '@nestjs/cqrs';

/**
 * 공지사항 삭제 시, 사용되는 커맨드 정의
 */

export class DeleteNoticeCommand implements ICommand {
  constructor(readonly noticeId: number) {}
}
