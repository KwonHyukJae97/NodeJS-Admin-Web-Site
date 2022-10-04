import { IsNotEmpty } from 'class-validator';
import { BoardType } from '../../entities/board-type.enum';

/**
 * 공지사항 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateNoticeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  isTop: boolean;

  @IsNotEmpty()
  noticeGrant: string;

  @IsNotEmpty()
  boardType: BoardType.NOTICE;
}
