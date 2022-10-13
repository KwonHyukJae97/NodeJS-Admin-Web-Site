import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 상세조회 시, 사용되는 커맨드 정의
 */

export class GetCommentDetailCommand implements ICommand {
  constructor(readonly qnaId: number, readonly role: string) {}
}
