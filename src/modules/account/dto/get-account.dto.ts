import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class GetAccountDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsDate()
  @IsNotEmpty()
  loginDate: Date;
}
