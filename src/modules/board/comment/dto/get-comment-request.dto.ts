import { PageRequest } from '../../../../common/utils/page-request';
import { IsOptional, IsString } from 'class-validator';

/**
 * 답변 전체 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCommentRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  searchKey: string | null;

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
    const param = new GetCommentRequestDto();
    param.searchKey = searchKey;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
