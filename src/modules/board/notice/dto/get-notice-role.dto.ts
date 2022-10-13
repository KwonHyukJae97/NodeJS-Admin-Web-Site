import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 공지사항 상세 조회 시, 필요한 필드로 구성한 요청 dto
 */

export class GetNoticeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
