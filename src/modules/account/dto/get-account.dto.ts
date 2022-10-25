import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

/**
 * 최근 로그인 시간 조회를 위한 dto 정의
 */
export class GetAccountDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsDate()
  @IsNotEmpty()
  loginDate: Date;
}
