import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 1:1 문의 전체 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetQnaRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
