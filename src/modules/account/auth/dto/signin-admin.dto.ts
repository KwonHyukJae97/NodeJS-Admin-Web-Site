import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignInAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
