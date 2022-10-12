import { IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board_file';

/**
 * 공지사항 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetNoticeDetailDto {
  @IsNotEmpty()
  @IsNumber()
  noticeId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  noticeGrant: string;

  @IsNotEmpty()
  @IsBoolean()
  isTop: boolean;

  @IsNotEmpty()
  @IsNumber()
  boardId: Board;

  fileList: BoardFile[];
}
