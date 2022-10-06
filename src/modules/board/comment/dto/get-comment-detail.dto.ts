import { IsNotEmpty } from 'class-validator';
import { Qna } from '../../qna/entities/qna';

/**
 * 답변 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetCommentDetailDto {
  @IsNotEmpty()
  qna: Qna;

  commentList: Comment[];
}
