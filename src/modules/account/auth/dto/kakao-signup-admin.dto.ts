import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 카카오 (관리자) 로그인 시 2차 정보를 입력을 위한 dto 정의
 */
export class KakaoSignUpAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly nickname: string;

  @IsNotEmpty()
  @IsString()
  readonly birth: string;

  //카카오에서 넘어오는 값 (남 : male = 0, 여: female = 1)
  @IsNotEmpty()
  @IsString()
  readonly gender: string;

  @IsNotEmpty()
  @IsString()
  readonly snsId: string;

  //카카오에서 발급해주는 토큰값
  @IsNotEmpty()
  @IsString()
  readonly snsToken: string;

  @IsNotEmpty()
  @IsString()
  readonly companyName: string;

  @IsNotEmpty()
  @IsNumber()
  readonly companyCode: number;

  @IsNotEmpty()
  @IsString()
  readonly businessNumber: string;
}
