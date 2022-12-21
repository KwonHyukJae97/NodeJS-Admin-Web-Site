import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 관리자 비밀번호 수정 시 필요한 dto 정의
 */
export class AdminUpdatePasswordDto {
  // //널 체크 추가
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly confirmPassword: string;
}
