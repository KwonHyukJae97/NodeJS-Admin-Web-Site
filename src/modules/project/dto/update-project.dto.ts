import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/boolean.decorator';

/**
 * 프로젝트 수정에 필요한 Dto 정의
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  wordLevelName: string;

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
