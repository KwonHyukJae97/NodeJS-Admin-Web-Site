import { IsNotEmpty, IsNumber } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board_file';
import { FaqCategory } from '../entities/faq_category';

/**
 * FAQ 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetFaqDetailDto {
  @IsNotEmpty()
  @IsNumber()
  faqId: number;

  @IsNotEmpty()
  categoryId: FaqCategory;

  @IsNotEmpty()
  boardId: Board;

  fileList: BoardFile[];
}
