import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from 'src/common/utils/page-request';

/**
 * 학습관리 전체 & 검색어에 해당하는 리스트 조회 dto 정의
 */
export class GetStudyRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchWord: string | null;

  constructor() {
    super();
  }

  static create(searchWord: string | null, pageNo: number, pageSize: number, totalData: boolean) {
    const param = new GetStudyRequestDto();
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
