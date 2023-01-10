import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/boolean.decorator';

/**
 * 프로젝트 수정에 필요한 Dto 정의
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  wordLevelName: string;

  @IsOptional()
  @IsNumber()
  wordLevelId: number;

  @IsOptional()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsBoolean()
  isService: boolean;

  @IsOptional()
  @IsString()
  updateBy: string;
}
