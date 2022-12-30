import { ICommand } from '@nestjs/cqrs';

/**
 * 단어레벨 수정 커네드 정의
 */
export class UpdateWordLevelCommand implements ICommand {
  constructor(
    readonly wordLevelId: number,
    readonly wordLevelName: string,
    readonly wordLevelSequence: number,
    readonly isService: boolean,
    readonly updateBy: string,
  ) {}
}
