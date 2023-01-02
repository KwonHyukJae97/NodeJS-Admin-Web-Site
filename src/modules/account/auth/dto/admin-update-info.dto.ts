import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 관리자 정보 수정 시 필요한 dto 정의
 */
export class AdminUpdateInfoDto {
  @IsNotEmpty()
  @IsNumber()
  readonly accountId: number;
  @IsString()
  @IsOptional()
  readonly nickname: string;

  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly phone: string;
}
