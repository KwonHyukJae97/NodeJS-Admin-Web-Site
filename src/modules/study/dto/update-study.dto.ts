import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdatePercentDto } from './update-percent.dto';

/**
 * 학습관리 수정 dto 정의
 */
export class UpdateStudyDto {
  //백분율 아이디
  @IsNumber()
  @IsOptional()
  readonly percentId: number;

  //레벨수준 아이디
  @IsNumber()
  @IsOptional()
  readonly levelStandardId: number;

  //학년별 레벨별 등급 아이디
  @IsNumber()
  @IsOptional()
  readonly gradeLevelRankId: number;

  //학습 구성 아이디
  @IsNumber()
  @IsOptional()
  readonly studyPlanId: number;

  //학습 단원 아이디
  @IsNumber()
  @IsOptional()
  readonly studyUnitId: number;

  //단어레벨 아이디
  @IsNumber()
  @IsOptional()
  readonly wordLevelId: number;

  //학습영역코드
  @IsString()
  @IsOptional()
  readonly studyTypeCode: string;

  //학습명
  @IsString()
  @IsOptional()
  readonly studyName: string;

  //학습대상

  @IsString()
  @IsOptional()
  readonly studyTarget: string;

  //학습정보

  @IsString()
  @IsOptional()
  readonly studyInformation: string;

  //성취도 평가 점수

  @IsNumber()
  @IsOptional()
  readonly testScore: number;

  //서비스 여부

  @IsBoolean()
  @IsOptional()
  readonly isService: boolean;

  //측정레벨이하

  @IsString()
  @IsOptional()
  readonly checkLevelUnder: string;

  //측정해당레벨

  @IsString()
  @IsOptional()
  readonly checkLevel: string;

  //등록자

  @IsString()
  @IsOptional()
  readonly regBy: string;

  //등급명
  @IsOptional()
  readonly percentList: UpdatePercentDto[];
  // @IsString()
  // @IsOptional()
  // readonly rankName: string;

  // //백분율

  // @IsNumber()
  // @IsOptional()
  // readonly percent: number;

  // //백분율 순번

  // @IsNumber()
  // @IsOptional()
  // readonly percentSequence: number;

  //----레벨수준정보----

  //수준

  @IsString()
  @IsOptional()
  readonly standard: string;

  //아는 수 오차

  @IsNumber()
  @IsOptional()
  readonly knownError: number;

  //레벨수준 순번

  @IsNumber()
  @IsOptional()
  readonly levelStandardSequence: number;

  //----학년별 레벨병 등급 정보----

  //학년

  @IsNumber()
  @IsOptional()
  readonly gradeRank: number;

  //----학습구성정보----이미지파일추가

  //등록진행방식

  @IsString()
  @IsOptional()
  readonly registerMode: string;

  //기본 학습 진행 방식

  @IsString()
  @IsOptional()
  readonly studyMode: string;

  //교재명

  @IsString()
  @IsOptional()
  readonly textbookName: string;

  //교재순번

  @IsNumber()
  @IsOptional()
  readonly textbookSequence: number;

  //----학습단원정보----

  //단원명

  @IsString()
  @IsOptional()
  readonly unitName: string;

  //단원순번

  @IsNumber()
  @IsOptional()
  readonly unitSequence: number;
}
