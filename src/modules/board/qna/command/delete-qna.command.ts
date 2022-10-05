import { ICommand } from '@nestjs/cqrs';

/**
 * 1:1 문의 삭제 시, 사용되는 커맨드 정의
 */

export class DeleteQnaCommand implements ICommand {
  constructor(readonly qnaId: number) {}
}
