import { ICommand } from '@nestjs/cqrs';

/**
 * 답변 수정 시, 사용되는 커맨드 정의
 */

export class UpdateCommentCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly commentId: number,
    readonly accountId: number,
  ) {}
}
