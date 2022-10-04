import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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
  @MaxLength(8)
  readonly birth: string;

  @IsNotEmpty()
  readonly gender: string;

  @IsNotEmpty()
  readonly companyId: number;

  @IsNotEmpty()
  readonly roleId: number;

  @IsNotEmpty()
  readonly isSuper: boolean;
}
