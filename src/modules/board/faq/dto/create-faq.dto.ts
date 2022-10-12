import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * FAQ 등록 시, 필요한 필드로 구성한 dto
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

  @IsNotEmpty()
  @IsString()
  fileType: FileType.FAQ;

  // 등록 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
