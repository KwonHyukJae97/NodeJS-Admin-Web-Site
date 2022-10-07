import { IsString } from 'class-validator';

export class FindIdDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly phone: string;
}
