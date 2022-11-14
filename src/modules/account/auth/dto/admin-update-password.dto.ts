import { IsString } from 'class-validator';

/**
 * 관리자 비밀번호 수정 시 필요한 dto 정의
 */
export class AdminUpdatePasswordDto {
  @IsString()
  readonly password: string;
}
