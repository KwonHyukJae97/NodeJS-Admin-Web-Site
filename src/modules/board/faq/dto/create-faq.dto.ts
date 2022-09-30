import { IsNotEmpty } from 'class-validator';

/**
 * FAQ 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateFaqDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
