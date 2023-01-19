import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PageRequest } from 'src/common/utils/page-request';

/**
 * 프로젝트 전체 & 검색어에 해당하는 리스트 조회 dto 정의
 */
export class GetProjectRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchKey: string | null;

  @IsString()
  @IsOptional()
  searchWord: string | null;

  @IsNumber()
  @IsOptional()
  wordLevelId: number | null;

  constructor() {
    super();
  }

  static create(
    searchKey: string | null,
    searchWord: string | null,
    wordLevelId: number | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetProjectRequestDto();
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.wordLevelId = wordLevelId;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
