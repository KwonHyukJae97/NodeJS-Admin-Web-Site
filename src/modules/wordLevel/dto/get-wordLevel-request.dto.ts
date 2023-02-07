import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PageRequest } from 'src/common/utils/page-request';

/**
 * 단어레벨 전체 & 검색어에 해당하는 리스트 조회 dto 정의
 */
export class GetWordLevelRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchWord: string | null;

  @IsBoolean()
  @IsOptional()
  isTotal: boolean | null;
  constructor() {
    super();
  }

  static create(
    searchWord: string | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
    isTotal: boolean,
  ) {
    const param = new GetWordLevelRequestDto();
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    param.isTotal = isTotal;
    return param;
  }
}
