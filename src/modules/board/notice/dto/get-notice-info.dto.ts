import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 공지사항 목록 조회/검색어 조회 시, 필요한 필드로 구성한 요청 dto
 */

export class GetNoticeInfoDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  noticeGrant: string;
}
