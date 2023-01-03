import { ICommand } from '@nestjs/cqrs';

/**
 * 단어레벨 등록 커멘드 정의
 */
export class CreateWordLevelCommand implements ICommand {
  constructor(
    readonly wordLevelName: string,
    readonly isService: boolean,
    readonly wordLevelSequence: number,
    readonly regBy: string,
  ) {}
}
