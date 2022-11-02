import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 구글 로그인 dto 정의
 */
export class UserGoogleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string | null;

  @IsString()
  @IsNotEmpty()
  birth: string | null;

  @IsString()
  @IsNotEmpty()
  snsId: string;

  @IsString()
  @IsNotEmpty()
  snsType: string;

  @IsString()
  @IsNotEmpty()
  snsToken: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
