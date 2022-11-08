import { IsNumber, IsOptional } from 'class-validator';

/**
 * 페이징 요청 시, 사용되는 클래스 정의
 */
export class PageRequest {
  // 요청 페이지 번호
  @IsNumber()
  @IsOptional()
  pageNo?: number | 1;

  // 한 페이지당 조회건 수
  @IsNumber()
  @IsOptional()
  pageSize?: number | 10;

  // 전체 데이터 조회 여부
  @IsOptional()
  totalData: boolean;

  getOffset(): number {
    if (this.pageNo < 1 || this.pageNo === null || this.pageNo === undefined) {
      this.pageNo = 1;
    }

    if (this.pageSize < 1 || this.pageSize === null || this.pageSize === undefined) {
      this.pageSize = 10;
    }

    return (this.pageNo - 1) * this.pageSize;
  }

  getLimit(): number {
    if (this.pageSize < 1 || this.pageSize === null || this.pageSize === undefined) {
      this.pageSize = 10;
    }
    return this.pageSize;
  }
}
