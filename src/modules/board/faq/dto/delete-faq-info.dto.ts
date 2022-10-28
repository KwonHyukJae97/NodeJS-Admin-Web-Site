import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * FAQ 삭제에 필요한 요청 Dto 정의
 */
export class DeleteFaqInfoDto {
  // 작성자 본인 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
