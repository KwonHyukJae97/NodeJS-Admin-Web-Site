import { ICommand } from '@nestjs/cqrs';

/**
 * 프로젝트 수정 커네드 정의
 */
export class UpdateProjectCommand implements ICommand {
  constructor(
    readonly projectId: number,
    readonly wordLevelName: string,
    readonly projectName: string,
    readonly isService: boolean,
    readonly updateBy: string,
  ) {}
}
