import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

/**
 * 1:1 문의 수정에 필요한 요청 Dto 정의
 */
export class UpdateQnaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  // 수정 권한 확인을 위한 임시 속성
  @IsNotEmpty()
  //@IsNumber()
  accountId: number;
}
