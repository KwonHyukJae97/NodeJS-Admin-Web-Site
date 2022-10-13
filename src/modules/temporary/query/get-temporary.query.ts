import { IQuery } from '@nestjs/cqrs';

/**
 * 휴면계정 처리 전 Temporary 테이블에 임시 데이터 조회
 */
export class GetTemporaryQuery implements IQuery {}
