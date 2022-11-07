/**
 * 프론트에 보내줄 때 사용되는 실제 Page 데이터 클래스 정의
 */
export class Page<T> {
  // 현재 페이지
  currentPage: number;
  // 한 페이지당 조회건 수
  pageSize: number;
  // 총 데이터 건수
  totalCount: number;
  // 총 페이지 수
  totalPage: number;
  // 조회 데이터 리스트
  items: T[];

  constructor(currentPage: number, pageSize: number, totalCount: number, items: T[]) {
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.totalPage = Math.ceil(totalCount / pageSize);
    this.items = items;
  }
}
