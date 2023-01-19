import { ICommand } from '@nestjs/cqrs';

/**
 * 단어정보 상세 정보 조회용 커멘드 정의
 */
export class GetWordLevelDetailCommand implements ICommand {
  constructor(readonly wordLevelId: number) {}
}
