import { IsNotEmpty } from 'class-validator';
import { Qna } from '../../qna/entities/qna';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * 답변 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetCommentDetailDto {
  @IsNotEmpty()
  qna: Qna;

  fileList: BoardFile[];

  commentList: Comment[];
}
