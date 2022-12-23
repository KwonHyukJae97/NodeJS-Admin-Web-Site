import { IQuery } from '@nestjs/cqrs';
import { GetFaqRequestDto } from '../dto/get-faq-request.dto';

/**
 * FAQ 전체 & 카테고리별 검색어에 해당하는 리스트 조회용 쿼리
 */
export class GetFaqListQuery implements IQuery {
  constructor(readonly param: GetFaqRequestDto) {}
}
