import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * 1:1 문의 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateQnaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  fileType: FileType.QNA;
}
