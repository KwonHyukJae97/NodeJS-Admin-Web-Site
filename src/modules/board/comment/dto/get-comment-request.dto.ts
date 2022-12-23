import { PageRequest } from '../../../../common/utils/page-request';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * 답변 전체 리스트 조회에 필요한 요청 Dto 정의
 */
export class GetCommentRequestDto extends PageRequest {
  @IsString()
  @IsOptional()
  writer: string | null;

  @IsString()
  @IsOptional()
  commenter: string | null;

  @IsString()
  @IsOptional()
  regDate: string | null;

  @IsBoolean()
  @IsOptional()
  isComment: boolean | null;

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
