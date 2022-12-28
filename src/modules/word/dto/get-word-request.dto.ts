import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from '../../../common/utils/page-request';

/**
 * 단어 전체 & 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetWordRequestDto extends PageRequest {
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
    searchKey: string | null,
    searchWord: string | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetWordRequestDto();
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
