import { IsNotEmpty, IsNumber } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';

/**
 * 1:1 문의 상세 조회 시, 필요한 필드로 구성한 응답 dto
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
