import { IsNotEmpty, IsString } from 'class-validator';

export class UserKakaoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string | null;

  @IsString()
  @IsNotEmpty()
  snsId: string;

  @IsString()
  @IsNotEmpty()
  snsToken: string;
}
