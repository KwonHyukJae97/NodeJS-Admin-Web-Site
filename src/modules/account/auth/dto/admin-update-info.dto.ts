import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 관리자 정보 수정 시 필요한 dto 정의
 */
export class AdminUpdateInfoDto {
  readonly nickname: string;

  @IsEmail()
  readonly email: string;

  readonly phone: string;
}
