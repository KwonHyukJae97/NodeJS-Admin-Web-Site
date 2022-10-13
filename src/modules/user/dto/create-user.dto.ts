import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  accountId: number;

  @IsNotEmpty()
  grade: number;
}
