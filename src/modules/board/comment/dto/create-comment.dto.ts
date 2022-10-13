import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 답변 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  //@IsNumber()
  adminId: number;
}
