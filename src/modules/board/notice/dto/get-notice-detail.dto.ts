import { IsNotEmpty } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 공지사항 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetNoticeDetailDto {
  @IsNotEmpty()
  noticeId: number;

  @IsNotEmpty()
  noticeGrant: string;

  @IsNotEmpty()
  isTop: boolean;

  @IsNotEmpty()
  boardId: Board;

  fileList: BoardFile[];
}
