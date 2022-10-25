import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 답변 수정에 필요한 요청 Dto 정의
 */
export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  //@IsNumber()
  adminId: number;
}
