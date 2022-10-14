import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * FAQ 수정 시, 필요한 필드로 구성한 dto
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

  // 작성자 본인 확인을 위해 임시 사용
  @IsNotEmpty()
  //@IsNumber()
  accountId: number;
}
