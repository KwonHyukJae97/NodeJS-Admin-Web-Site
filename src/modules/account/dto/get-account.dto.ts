import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class GetAccountDto {
  @IsNumber()
  @Type(() => Number)
  accountId: number;

  @IsDate()
  loginDate: Date;
}
