import { IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';
import { Type } from 'class-transformer';

/**
 * 공지사항 수정 시, 필요한 필드로 구성한 dto
 */

export class UpdateNoticeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isTop: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  noticeGrant: string;

  // 수정 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  //@Type(() => Number)
  //@IsNumber()
  accountId: number;

  // 작성자 본인 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
