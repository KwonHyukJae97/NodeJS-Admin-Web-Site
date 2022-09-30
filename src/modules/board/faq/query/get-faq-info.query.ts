import { IQuery } from '@nestjs/cqrs';

/**
 * FAQ 전체 조회 시, 사용되는 쿼리 클래스
 */

export class GetFaqInfoQuery implements IQuery {}
