import { IsNotEmpty, IsString } from 'class-validator';
import { PageRequest } from '../../../common/utils/page-request';

/**
 * 본단어 상세 조회에 필요한 요청 Dto 정의
 */
export class GetOriginWordRequestDto extends PageRequest {
  @IsString()
  @IsNotEmpty()
  searchKey: string;

  @IsString()
  @IsNotEmpty()
  searchWord: string;

  constructor() {
    super();
  }

  static create(
    searchKey: string,
    searchWord: string,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetOriginWordRequestDto();
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
