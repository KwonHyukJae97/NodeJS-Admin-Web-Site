import { IsNotEmpty, IsString } from 'class-validator';
/**
 * 사용자 로그인을 위한 DTO
 */
export class SignInUserDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
