import { IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';

/**
 * 공지사항 상세 조회에 필요한 응답 Dto 정의
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
