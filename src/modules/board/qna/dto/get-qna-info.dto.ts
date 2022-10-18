import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 1:1 문의 상세 정보 조회에 필요한 요청 Dto 정의
 */
export class GetQnaInfoDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsNumber()
  accountId: number;
}
