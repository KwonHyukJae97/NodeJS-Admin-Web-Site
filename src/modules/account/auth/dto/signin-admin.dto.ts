import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 관리자 로그인을 위한 DTO
 */
export class SignInAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
