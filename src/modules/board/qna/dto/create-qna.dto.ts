import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 1:1 문의 등록에 필요한 요청 Dto 정의
 */
export class CreateQnaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
