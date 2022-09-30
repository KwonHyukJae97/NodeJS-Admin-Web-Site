import { IsNotEmpty } from 'class-validator';

/**
 * FAQ 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateFaqDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
