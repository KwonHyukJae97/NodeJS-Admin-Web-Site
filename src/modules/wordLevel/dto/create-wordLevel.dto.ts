import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 단어레벨 등록 dto 정의
 */
export class CreateWordLevelDto {
  @IsNotEmpty()
  @IsString()
  readonly wordLevelName: string;

  @IsNotEmpty()
  @IsNumber()
  readonly wordLevelSequence: number;

  @IsBoolean()
  readonly isService: boolean;

  @IsNotEmpty()
  @IsString()
  readonly regBy: string;
}
