import { ICommand } from '@nestjs/cqrs';

/**
 * 학습관리 수정 커멘드 정의
 */
export class UpdateStudyCommand implements ICommand {
  constructor(
    readonly studyName: string,
    readonly studyTarget: string,
    readonly studyInformation: string,
    readonly testScore: number,
    readonly isService: boolean,
    readonly checkLevelUnder: string,
    readonly checkLevel: string,
    readonly updateBy: string,
  ) {}
}
