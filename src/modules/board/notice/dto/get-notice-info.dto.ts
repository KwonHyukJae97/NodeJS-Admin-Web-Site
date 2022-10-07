import { IsNotEmpty } from 'class-validator';

/**
 * 공지사항 목록 조회 시, 필요한 필드로 구성한 요청 dto
 */

export class GetNoticeInfoDto {
  @IsNotEmpty()
  role: string;

  @IsNotEmpty()
  noticeGrant: string;
}
