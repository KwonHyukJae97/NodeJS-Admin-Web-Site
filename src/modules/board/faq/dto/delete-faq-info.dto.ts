import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * FAQ 삭제 시, 필요한 필드로 구성한 요청 dto
 */

export class DeleteFaqInfoDto {
  // 수정 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  // 작성자 본인 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
