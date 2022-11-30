import { PageRequest } from '../../../../common/utils/page-request';

/**
 * 답변 전체 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCommentRequestDto extends PageRequest {
  constructor() {
    super();
  }

  static create(pageNo: number, pageSize: number, totalData: boolean) {
    const param = new GetCommentRequestDto();
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
