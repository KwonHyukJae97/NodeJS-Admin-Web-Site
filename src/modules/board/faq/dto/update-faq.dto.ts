import { IsNotEmpty } from 'class-validator';
import { BoardType } from '../../entities/board-type.enum';

/**
 * FAQ 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateFaqDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  categoryName: string;

  @IsNotEmpty()
  boardType: BoardType.FAQ;
}
