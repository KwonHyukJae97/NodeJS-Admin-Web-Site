import { ICommand } from '@nestjs/cqrs';
import { UpdatePercentDto } from '../dto/update-percent.dto';

/**
 * 학습관리 수정 커멘드 정의
 */
export class UpdateStudyCommand implements ICommand {
  constructor(
    readonly studyId: number,
    readonly percentId: number,
    readonly levelStandardId: number,
    readonly gradeLevelRankId: number,
    readonly studyPlanId: number,
    readonly studyUnitId: number,
    readonly wordLevelId: number,
    readonly studyTypeCode: string,
    readonly studyName: string,
    readonly studyTarget: string,
    readonly studyInformation: string,
    readonly testScore: number,
    readonly isService: boolean,
    readonly checkLevelUnder: string,
    readonly checkLevel: string,
    readonly regBy: string,
    readonly percentList: UpdatePercentDto[],
    // readonly rankName: string,
    // readonly percent: number,
    // readonly percentSequence: number,
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
