import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 상세 정보 조회용 커멘드 정의
 */
export class GetCommentDetailCommand implements ICommand {
  constructor(readonly qnaId: number, readonly role: string) {}
}
