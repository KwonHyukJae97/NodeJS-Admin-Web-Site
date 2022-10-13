import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 수정 시, 사용되는 커맨드 정의
 */

export class UpdateCommentCommand implements ICommand {
  constructor(readonly commentId: number, readonly comment: string, readonly adminId: number) {}
}
