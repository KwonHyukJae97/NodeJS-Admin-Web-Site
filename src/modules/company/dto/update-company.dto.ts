import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 회원사 정보 수정에 필요한 Dto 정의
 */
export class UpdateCompanyDto {
  @IsNotEmpty()
  @IsString()
  readonly companyName: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyCode: number;
}
