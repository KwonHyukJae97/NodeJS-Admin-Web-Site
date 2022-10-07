import { IQuery } from '@nestjs/cqrs';

/**
 * 공지사항 목록 조회 시, 사용되는 쿼리 클래스
 */

export class GetNoticeListQuery implements IQuery {}
