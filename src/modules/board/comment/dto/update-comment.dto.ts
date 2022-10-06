import { IsNotEmpty } from 'class-validator';

/**
 * 답변 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateCommentDto {
  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  adminId: number;
}
