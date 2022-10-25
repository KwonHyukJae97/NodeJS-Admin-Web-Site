import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 공지사항 상세 정보 조회에 필요한 요청 Dto 정의
 */
export class GetNoticeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
