import { ICommand } from '@nestjs/cqrs';

/**
 * 단어레벨 삭제 커멘드 정의
 */
export class DeleteWordLevelCommand implements ICommand {
  constructor(readonly wordLevelId: number, readonly delDate: Date) {}
}
