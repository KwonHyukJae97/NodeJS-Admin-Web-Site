import { IsNotEmpty } from 'class-validator';
import { BoardType } from '../../entities/board-type.enum';

/**
 * 공지사항 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateNoticeDto {
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

  // 등록 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  role: string;
}
