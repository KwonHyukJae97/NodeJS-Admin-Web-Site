import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 네이버 로그인 dto 정의
 */
export class UserNaverDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  snsId: string;

  @IsString()
  @IsNotEmpty()
  snsToken: string;

  @IsString()
  @IsNotEmpty()
  snsType: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsString()
  @IsNotEmpty()
  birth: string | null;

  // @IsString()
  // @IsNotEmpty()
  // birthYear: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
