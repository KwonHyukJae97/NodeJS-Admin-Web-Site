import { IsNotEmpty } from 'class-validator';

/**
 * 답변 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateCommentDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  // 수정 권한 확인을 위한 임시 속성
  @IsNotEmpty()
  accountId: number;
}
