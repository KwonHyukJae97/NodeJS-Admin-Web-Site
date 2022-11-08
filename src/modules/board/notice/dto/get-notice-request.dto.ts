import { PageRequest } from '../../../../common/utils/page-request';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 공지사항 전체 & 검색어 해당하는 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetNoticeRequestDto extends PageRequest {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  noticeGrant: string;

  @IsString()
  @IsOptional()
  searchWord: string | null;

  constructor() {
    super();
  }

  static create(
    role: string,
    noticeGrant: string,
    searchWord: string | null,
    pageNo: number,
    pageSize: number,
    totalData: boolean,
  ) {
    const param = new GetNoticeRequestDto();
    param.role = role;
    param.noticeGrant = noticeGrant;
    param.searchWord = searchWord;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
