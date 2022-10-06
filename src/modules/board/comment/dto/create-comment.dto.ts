import { IsNotEmpty } from 'class-validator';

/**
 * 답변 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateCommentDto {
  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  adminId: number;
}
