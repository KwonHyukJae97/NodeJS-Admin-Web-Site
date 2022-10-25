import { IsNotEmpty, IsString } from 'class-validator';

/**
 * FAQ 전체 & 카테고리별 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetFaqInfoDto {
  @IsNotEmpty()
  @IsString()
  role: string;
}
