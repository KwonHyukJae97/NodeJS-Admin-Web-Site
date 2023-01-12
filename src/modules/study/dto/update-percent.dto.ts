import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
/**
 * 백분율 수정 dto 정의
 */
export class UpdatePercentDto {
  @IsOptional()
  @IsNumber()
  percentId: number;

  @IsOptional()
  @IsNumber()
  studyId: number;

  @IsOptional()
  @IsString()
  rankName: string;

  @IsOptional()
  @IsNumber()
  percent: number;

  @IsOptional()
  @IsNumber()
  percentSequence: number;
}
