import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 회원사 정보 수정에 필요한 Dto 정의
 */
export class UpdateCompanyDto {
  @IsNotEmpty()
  @IsString()
  readonly companyName: string;

  @IsOptional()
  @IsString()
  readonly businessNumber: string;
}
