import { IsNotEmpty, IsString } from 'class-validator';

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

  //sns_type (00: naver, 01: kakao, 02: google, 03: apple)
  @IsNotEmpty()
  @IsString()
  readonly snsType: string;

  //카카오에서 발급해주는 토큰값
  @IsNotEmpty()
  @IsString()
  readonly snsToken: string;

  //관리자 사용자 구분 (true: 1(관리자), false: 0(사용자))
  @IsNotEmpty()
  readonly division: boolean;
}
