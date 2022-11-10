import { IsOptional, IsString } from 'class-validator';

/**
 * 회원사 전체 & 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCompanyRequestDto {
  @IsOptional()
  @IsString()
  searchWord: string | null;
}
