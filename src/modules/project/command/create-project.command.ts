import { ICommand } from '@nestjs/cqrs';

/**
 * 프로젝트 생성 커멘드 정의
 */
export class CreateProjectCommand implements ICommand {
  constructor(readonly projectName: string, readonly regBy: string, readonly wordLevelId: number) {}
}
