import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FileType } from '../../../file/entities/file-type.enum';
import { Type } from 'class-transformer';

/**
 * 공지사항 등록 시, 필요한 필드로 구성한 dto
 */

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  // boolean 타입으로 변환
  @Type(() => Boolean)
  @IsBoolean()
  isTop: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  noticeGrant: string;

  // 등록 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
