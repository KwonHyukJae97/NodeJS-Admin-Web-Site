import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 관리자 정보 수정 시 필요한 dto 정의
 */
export class AdminUpdateInfoDto {
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
