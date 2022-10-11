import { IsNotEmpty } from 'class-validator';

/**
 * 1:1 문의 목록 조회 시, 필요한 필드로 구성한 요청 dto
 */

export class GetQnaRoleDto {
  @IsNotEmpty()
  role: string;
}
