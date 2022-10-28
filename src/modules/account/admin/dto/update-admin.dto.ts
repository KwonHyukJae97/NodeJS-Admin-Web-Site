import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * 관리자 정보 수정 시 필요한 dto 정의
 */
export class UpdateAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  readonly nickname: string;

  @IsString()
  @IsEmail()
  @MaxLength(60)
  readonly email: string;

  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{4,16}$/)
  readonly password: string;

  @IsString()
  readonly phone: string;

  @IsNumber()
  @Type(() => Number)
  readonly roleId: number;

  @IsNumber()
  @Type(() => Number)
  readonly isSuper: boolean;
}
