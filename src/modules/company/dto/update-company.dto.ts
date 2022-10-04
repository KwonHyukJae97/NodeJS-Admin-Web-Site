import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  readonly companyName: string;

  @IsNumber()
  @Type(() => Number)
  readonly companyCode: number;
}
