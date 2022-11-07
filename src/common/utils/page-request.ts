import { IsOptional, IsString } from 'class-validator';

/**
 * 페이징 요청 시, 사용되는 클래스 정의
 */
export class PageRequest {
  //@IsOptional() 데코레이터는 undefined도 받을 수 있다.
  @IsString()
  @IsOptional()
  pageNo?: number | 1;

  @IsString()
  @IsOptional()
  pageSize?: number | 10;

  @IsOptional()
  totalData: boolean;

  getOffset(): number {
    if (this.pageNo < 1 || this.pageNo === null || this.pageNo === undefined) {
      this.pageNo = 1;
    }

    if (this.pageSize < 1 || this.pageSize === null || this.pageSize === undefined) {
      this.pageSize = 10;
    }

    return (Number(this.pageNo) - 1) * Number(this.pageSize);
  }

  getLimit(): number {
    if (this.pageSize < 1 || this.pageSize === null || this.pageSize === undefined) {
      this.pageSize = 10;
    }
    return Number(this.pageSize);
  }
}
