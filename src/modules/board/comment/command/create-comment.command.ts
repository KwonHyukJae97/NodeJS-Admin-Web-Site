import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 등록 시, 사용되는 커맨드 정의
 */

export class CreateCommentCommand implements ICommand {
  constructor(readonly qnaId: number, readonly comment: string, readonly adminId: number) {}
}
