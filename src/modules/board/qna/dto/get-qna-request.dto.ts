import { PageRequest } from '../../../../common/utils/page-request';
import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * 1:1 문의 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetQnaRequestDto extends PageRequest {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  constructor() {
    super();
  }

  static create(accountId: number, pageNo: number, pageSize: number, totalData: boolean) {
    const param = new GetQnaRequestDto();
    param.accountId = accountId;
    param.pageNo = pageNo;
    param.pageSize = pageSize;
    param.totalData = totalData;
    return param;
  }
}
