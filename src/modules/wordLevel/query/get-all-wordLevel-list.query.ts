import { IQuery } from '@nestjs/cqrs';

/**
 * 단어레벨 전체 조회용 쿼리 정의
 */
export class GetAllWordLevelQuery implements IQuery {}
