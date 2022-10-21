import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 공지사항 전체 & 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
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
