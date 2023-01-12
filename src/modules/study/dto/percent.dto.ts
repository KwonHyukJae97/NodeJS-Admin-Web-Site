import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
/**
 * 백분율 등록 dto 정의
 */
export class PercentDto {
  @IsNotEmpty()
  @IsNumber()
  percentId: number;

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
