import { IsString } from 'class-validator';

/**
 * 아이디 찾기를 위한 Dto
 */
export class FindIdDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly phone: string;
}
