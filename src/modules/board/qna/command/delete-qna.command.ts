import { ICommand } from '@nestjs/cqrs';

/**
 * 1:1 문의 삭제용 커맨드 정의
 */
export class DeleteQnaCommand implements ICommand {
  constructor(readonly qnaId: number, readonly accountId: number) {}
}
