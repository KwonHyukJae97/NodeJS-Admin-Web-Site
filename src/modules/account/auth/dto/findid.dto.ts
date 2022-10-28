import { IsString } from 'class-validator';

/**
 * 아이디 찾기를 위한 Dto 정의
 */
export class FindIdDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly phone: string;
}
