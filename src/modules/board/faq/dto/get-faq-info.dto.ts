import { IsNotEmpty, IsString } from 'class-validator';

/**
 * FAQ 목록 조회 시, 필요한 필드로 구성한 요청 dto (권한에 따라 조회 목록 구분을 위해 임시로 작성 > 추후에는 토큰값을 통해 구분할 예정)
 */

export class GetFaqInfoDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
