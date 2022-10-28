import { IQuery } from '@nestjs/cqrs';

/**
 * FAQ 카테고리 리스트 조회용 쿼리
 */
export class GetCategoryListQuery implements IQuery {
  constructor(readonly role: string) {}
}
