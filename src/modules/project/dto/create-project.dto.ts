import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 프로젝트 등록 dto 정의
 */
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsString()
  wordLevelName: string;

  @IsNotEmpty()
  @IsString()
  regBy: string;

  //단어정보 등록 추가하기
}
