import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 공지사항 수정에 필요한 요청 Dto 정의
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
