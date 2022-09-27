import { IQuery } from "@nestjs/cqrs";

/**
 * 공지사항 상세 조회 시, 사용되는 쿼리 클래스
 */

export class GetNoticeDetailQuery implements IQuery {
  constructor(readonly noticeId: number) {}
}
