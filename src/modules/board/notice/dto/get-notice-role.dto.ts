import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 공지사항 상세조회/삭제에 필요한 요청 Dto 정의
 */
export class GetNoticeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
