import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * FAQ 등록에 필요한 요청 Dto 정의
 */
export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  categoryName: string;
}
