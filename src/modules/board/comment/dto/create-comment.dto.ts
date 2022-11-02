import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 답변 등록에 필요한 요청 Dto 정의
 */
export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;
}
