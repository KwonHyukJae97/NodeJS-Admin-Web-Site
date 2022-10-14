import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * 1:1 문의 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateQnaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  // 수정 권한 확인을 위한 임시 속성
  @IsNotEmpty()
  //@IsNumber()
  accountId: number;
}
