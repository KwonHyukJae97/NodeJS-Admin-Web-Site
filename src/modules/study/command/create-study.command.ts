import { ICommand } from '@nestjs/cqrs';

/**
 * 학습관리 생성 커멘드 정의
 */
export class CreateStudyCommand implements ICommand {
  constructor(
    readonly studyTypeCode: string,
    readonly studyName: string,
    readonly studyTarget: string,
    readonly studyInformation: string,
    readonly testScore: number,
    readonly isService: boolean,
    readonly checkLevelUnder: string,
    readonly checkLevel: string,
    readonly regBy: string,
    readonly rankName: string,
    readonly percent: number,
    readonly percentSequence: number,
    readonly standard: string,
    readonly knownError: number,
    readonly levelStandardSequence: number,
    readonly gradeRank: number,
    readonly registerMode: string,
    readonly studyMode: string,
    readonly textbookName: string,
    readonly textbookSequence: number,
    readonly unitName: string,
    readonly unitSequence: number,
  ) {}
}
