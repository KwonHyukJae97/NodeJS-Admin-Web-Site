import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 프로젝트 등록 dto 정의
 */
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsString()
  regBy: string;

  @IsNotEmpty()
  @IsNumber()
  wordLevelId: number;
}
