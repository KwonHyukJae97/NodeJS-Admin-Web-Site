import { IsNotEmpty, IsNumber } from 'class-validator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { FaqCategory } from '../entities/faq_category';

/**
 * FAQ 상세 조회에 필요한 응답 Dto 정의
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
