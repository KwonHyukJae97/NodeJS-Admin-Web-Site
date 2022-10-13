import { IQuery } from '@nestjs/cqrs';

/**
 * 앱 사용자 전체 조회용 쿼리
 */
export class GetAllUserQuery implements IQuery {}
