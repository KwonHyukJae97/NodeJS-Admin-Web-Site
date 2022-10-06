import { IsNotEmpty } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 답변 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetCommentListDto {
  @IsNotEmpty()
  qnaId: number;

  @IsNotEmpty()
  accountId: number;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  viewCount: number;

  @IsNotEmpty()
  regDate: Date;

  @IsNotEmpty()
  isComment: boolean;
}
