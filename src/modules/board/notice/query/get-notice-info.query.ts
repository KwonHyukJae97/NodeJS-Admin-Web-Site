import { IQuery } from '@nestjs/cqrs';

/**
 * 공지사항 전체 조회 시, 사용되는 쿼리 클래스
 */

export class GetNoticeInfoQuery implements IQuery {}
