import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from '../../../common/utils/page-request';
import { ToBoolean } from '../../../common/decorator/boolean.decorator';

/**
 * 중복 단어 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetDuplicateWordRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchKey: string | null;

  @IsOptional()
  @ToBoolean()
  searchWord: boolean | null;

  constructor() {
    super();
  }

  static create(
    searchKey: string | null,
    searchWord: boolean | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetDuplicateWordRequestDto();
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
