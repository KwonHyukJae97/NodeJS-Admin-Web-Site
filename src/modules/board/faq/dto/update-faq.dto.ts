import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * FAQ 수정에 필요한 요청 Dto 정의
 */
export class UpdateFaqDto {
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

  // 수정 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
