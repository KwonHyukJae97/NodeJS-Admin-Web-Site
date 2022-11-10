import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * 관리자 회원가입을 위한 dto 정의
 */
export class SignUpAdminDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(5)
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i, {
    message: '이메일 양식에 맞게 입력해주세요.',
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  readonly nickname: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  readonly birth: string;

  @IsNotEmpty()
  readonly gender: string;

  readonly companyId: number;

  readonly roleId: number;

  readonly isSuper: boolean;

  //관리자 사용자 구분 (true: 1(관리자), false: 0(사용자))
  readonly division: boolean;

  @IsNotEmpty()
  @IsString()
  readonly companyName: string;

  @IsNotEmpty()
  @IsNumber()
  readonly companyCode: number;
}
