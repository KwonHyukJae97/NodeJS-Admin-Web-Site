import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from 'src/common/utils/page-request';

/**
 * 회원사 전체 & 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCompanyRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchWord: string | null;

  constructor() {
    super();
  }

  static create(searchWord: string | null, pageNo: number, pageSize: number, totalData: boolean) {
    const param = new GetCompanyRequestDto();
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
