import { IQuery } from '@nestjs/cqrs';

/**
 * FAQ 카테고리 리스트 조회 시, 사용되는 쿼리 클래스 (권한에 따라 조회 목록 구분을 위해 임시로 작성 > 추후에는 토큰값을 통해 구분할 예정)
 */

export class GetCategoryListQuery implements IQuery {
  constructor(readonly role: string) {}
}
