import { ICommand } from '@nestjs/cqrs';
import { Response } from 'express';

/**
 * 공지사항 삭제 시, 사용되는 커맨드 정의
 */

export class DeleteNoticeCommand implements ICommand {
  constructor(readonly noticeId: number, readonly res: Response) {}
}
