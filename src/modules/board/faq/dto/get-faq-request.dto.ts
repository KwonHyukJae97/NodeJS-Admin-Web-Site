import { PageRequest } from '../../../../common/utils/page-request';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * FAQ 전체 & 카테고리별 검색어에 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetFaqRequestDto extends PageRequest {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  searchKey: string | null;

  @IsString()
  @IsOptional()
  searchWord: string | null;

  constructor() {
    super();
  }

  static create(
    role: string,
    searchKey: string | null,
    searchWord: string | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetFaqRequestDto();
    param.role = role;
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
