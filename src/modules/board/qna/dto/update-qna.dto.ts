import { IsNotEmpty } from 'class-validator';
import { BoardType } from '../../entities/board-type.enum';

/**
 * 1:1 문의 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateQnaDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  boardType: BoardType.QNA;
}
