import { IsNotEmpty } from 'class-validator';
import { Qna } from '../../qna/entities/qna';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * 답변 상세 조회에 필요한 응답 Dto 정의
 */
export class GetCommentDetailDto {
  @IsNotEmpty()
  qna: Qna;

  fileList: BoardFile[];

  commentList: Comment[];
}
