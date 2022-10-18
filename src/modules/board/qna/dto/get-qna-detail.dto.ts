import { IsNotEmpty, IsNumber } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';

/**
 * 1:1 문의 상세 조회에 필요한 응답 Dto 정의
 */
export class GetQnaDetailDto {
  @IsNotEmpty()
  @IsNumber()
  qnaId: number;

  @IsNotEmpty()
  boardId: Board;

  fileList: BoardFile[];

  commentList: Comment[];
}
