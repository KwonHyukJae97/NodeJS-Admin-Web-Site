import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 답변 전체 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCommentInfoDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
