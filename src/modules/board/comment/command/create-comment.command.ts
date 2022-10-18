import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 등록용 커맨드 정의
 */
export class CreateCommentCommand implements ICommand {
  constructor(readonly qnaId: number, readonly comment: string, readonly adminId: number) {}
}
