import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 단어레벨 정보 수정 dto 정의
 */
export class UpdateWordLevelDto {
  @IsNumber()
  @IsOptional()
  readonly wordLevelSequence: number;

  @IsString()
  @IsOptional()
  readonly wordLevelName: string;

  @IsBoolean()
  @IsOptional()
  readonly isService: boolean;

  @IsString()
  @IsOptional()
  readonly updateBy: string;
}
